import path from 'path';
import _ from 'lodash';
import concat from 'concat-stream';
import Printer from 'pdfmake';
import xRegExp from 'xregexp';

const assetPath = path.resolve(__dirname, 'assets');

const tableBorderWidth = 1;

function getFont(text) {
  // Once unicode regex scripts are fully supported we should be able to get rid of the dependency
  // on xRegExp library.  See https://github.com/tc39/proposal-regexp-unicode-property-escapes
  // for more information. We are matching Han characters which is one of the supported unicode scripts
  // (you can see the full list of supported scripts here: http://www.unicode.org/standard/supported.html).
  // This will match Chinese, Japanese, Korean and some other Asian languages.
  const isCKJ = xRegExp('\\p{Han}').test(text, 'g');
  if(isCKJ) {
    return 'noto-cjk';
  } else {
    return 'Roboto';
  }
}

class PdfMaker {
  constructor(layout, logo) {
    const fontPath = (filename) => path.resolve(assetPath, 'fonts', filename);
    const fonts = {
      Roboto: {
        normal: fontPath('Roboto-Regular.ttf'),
        bold: fontPath('Roboto-Medium.ttf'),
        italics: fontPath('Roboto-Italic.ttf'),
        bolditalics: fontPath('Roboto-Italic.ttf'),
      },
      'noto-cjk': { // Roboto does not support CJK characters, so we'll fall back on this font if we detect them.
        normal: fontPath('NotoSansCJKtc-Regular.ttf'),
        bold: fontPath('NotoSansCJKtc-Medium.ttf'),
        italics: fontPath('NotoSansCJKtc-Regular.ttf'),
        bolditalics: fontPath('NotoSansCJKtc-Medium.ttf'),
      }
    };

    this._layout = layout;
    this._logo = logo;
    this._title = '';
    this._content = [];
    this._printer = new Printer(fonts);
  }

  _addContents(contents) {
    const groupCount = this._content.length;

    // inject a page break for every 2 groups on the page
    if (groupCount > 0 && groupCount % 2 === 0) {
      contents = [{
        text: '',
        pageBreak: 'after',
      }].concat(contents);
    }
    this._content.push(contents);
  }

  addImage(base64EncodedData, { title = '', description = '' }) {
    const contents = [];

    if (title && title.length > 0) {
      contents.push({
        text: title,
        style: 'heading',
        font: getFont(title),
        noWrap: true,
      });
    }

    if (description && description.length > 0) {
      contents.push({
        text: description,
        style: 'subheading',
        font: getFont(description),
        noWrap: true,
      });
    }

    const img = {
      image: `data:image/png;base64,${base64EncodedData}`,
      alignment: 'center',
    };

    const size = this._layout.getPdfImageSize();
    img.height = size.height;
    img.width = size.width;

    const wrappedImg = {
      table: {
        body: [
          [ img ],
        ],
      },
      layout: 'simpleBorder'
    };

    contents.push(wrappedImg);

    this._addContents(contents);
  }

  addHeading(headingText, opts = {}) {
    const contents = [];
    contents.push({
      text: headingText,
      style: ['heading'].concat(opts.styles || []),
      font: getFont(headingText)
    });
    this._addContents(contents);
  }

  setTitle(title) {
    this._title = title;
  }

  generate() {
    const docTemplate = _.assign(getTemplate(this._layout, this._logo, this._title), { content: this._content });
    this._pdfDoc = this._printer.createPdfKitDocument(docTemplate, getDocOptions());
    return this;
  }

  getBuffer() {
    if (!this._pdfDoc) throw new Error('Document stream has not been generated');
    return new Promise((resolve, reject) => {
      const concatStream = concat(function (pdfBuffer) {
        resolve(pdfBuffer);
      });

      this._pdfDoc.on('error', reject);
      this._pdfDoc.pipe(concatStream);
      this._pdfDoc.end();
    });
  }

  getStream() {
    if (!this._pdfDoc) throw new Error('Document stream has not been generated');
    this._pdfDoc.end();
    return this._pdfDoc;
  }
}

function getTemplate(layout, logo, title) {
  const pageMarginTop = 40;
  const pageMarginBottom = 80;
  const pageMarginWidth = 40;
  const headingFontSize = 14;
  const headingMarginTop = 10;
  const headingMarginBottom = 5;
  const headingHeight = (headingFontSize * 1.5) + headingMarginTop + headingMarginBottom;
  const subheadingFontSize = 12;
  const subheadingMarginTop = 0;
  const subheadingMarginBottom = 5;
  const subheadingHeight = (subheadingFontSize * 1.5) + subheadingMarginTop + subheadingMarginBottom;


  return {
    // define page size
    pageOrientation: layout.getPdfPageOrientation(),
    pageSize: layout.getPdfPageSize({
      pageMarginTop,
      pageMarginBottom,
      pageMarginWidth,
      tableBorderWidth,
      headingHeight,
      subheadingHeight,
    }),
    pageMargins: [ pageMarginWidth, pageMarginTop, pageMarginWidth, pageMarginBottom ],

    header: function () {
      return {
        margin: [ pageMarginWidth, pageMarginTop / 4, pageMarginWidth, 0 ],
        text: title,
        font: getFont(title),
        style: {
          color: '#aaa',
        },
        fontSize: 10,
        alignment: 'center'
      };
    },

    footer: function (currentPage, pageCount) {
      const logoPath = path.resolve(assetPath, 'img', 'logo-grey.png');
      return {
        margin: [ pageMarginWidth, pageMarginBottom / 4, pageMarginWidth, 0 ],
        layout: 'noBorder',
        table: {
          widths: [ 100, '*', 100],
          body: [
            [{
              fit: [100, 35],
              image: logo || logoPath,
            }, {
              alignment: 'center',
              text: 'Page ' + currentPage.toString() + ' of ' + pageCount,
              style: {
                color: '#aaa'
              },
            }, ''],
            [
              logo ? {
                text: 'Powered by Elastic',
                fontSize: 10,
                style: {
                  color: "#aaa"
                },
                margin: [0, 2, 0, 0]
              } : '',
              '',
              ''
            ]
          ]
        }
      };
    },

    styles: {
      heading: {
        alignment: 'left',
        fontSize: headingFontSize,
        bold: true,
        marginTop: headingMarginTop,
        marginBottom: headingMarginBottom,
      },
      subheading: {
        alignment: 'left',
        fontSize: subheadingFontSize,
        italics: true,
        marginLeft: 20,
        marginBottom: subheadingMarginBottom,
      },
      warning: {
        color: '#f39c12' // same as @brand-warning in Kibana colors.less
      }
    },

    defaultStyle: {
      fontSize: 12,
      font: 'Roboto',
    },
  };
}

function getDocOptions() {
  return {
    tableLayouts: {
      noBorder: {
        // format is function (i, node) { ... };
        hLineWidth: () => 0,
        vLineWidth: () => 0,
        paddingLeft: () => 0,
        paddingRight: () => 0,
        paddingTop: () => 0,
        paddingBottom: () => 0,
      },
      simpleBorder: {
        // format is function (i, node) { ... };
        hLineWidth: () => tableBorderWidth,
        vLineWidth: () => tableBorderWidth,
        hLineColor: () => 'silver',
        vLineColor: () => 'silver',
        paddingLeft: () => 0,
        paddingRight: () => 0,
        paddingTop: () => 0,
        paddingBottom: () => 0,
      }
    }
  };
}

export const pdf = {
  create: (layout, logo) => new PdfMaker(layout, logo)
};
