import d3 from 'd3';
import numeral from 'numeral';
import inputIcon from 'plugins/monitoring/icons/logstash/input.svg';
import filterIcon from 'plugins/monitoring/icons/logstash/filter.svg';
import outputIcon from 'plugins/monitoring/icons/logstash/output.svg';
import queueIcon from 'plugins/monitoring/icons/logstash/queue.svg';
import ifIcon from 'plugins/monitoring/icons/logstash/if.svg';
import infoIcon from 'plugins/monitoring/icons/alert-blue.svg';
import { PluginVertex } from '../models/graph/plugin_vertex';
import { IfVertex } from '../models/graph/if_vertex';

// Each vertex consists of two lines (rows) of text
// - The first line shows the name and ID of the vertex
// - The second line shows stats about the vertex
// There is also an icon denoting the type of vertex

const BASE_OFFSET_LEFT_PX = 7;
const FIRST_LINE_OFFSET_TOP_PX = 18;
const SECOND_LINE_OFFSET_TOP_PX = FIRST_LINE_OFFSET_TOP_PX + 22;

const PCT_EXECUTION_OFFSET_LEFT_PX = BASE_OFFSET_LEFT_PX;
const PCT_EXECUTION_OFFSET_TOP_PX = SECOND_LINE_OFFSET_TOP_PX;

const PCT_EXECUTION_BG_OFFSET_LEFT_PX = PCT_EXECUTION_OFFSET_LEFT_PX - 4;
const PCT_EXECUTION_BG_OFFSET_TOP_PX = PCT_EXECUTION_OFFSET_TOP_PX - 15;
const PCT_EXECUTION_BG_WIDTH_PX = 43;
const PCT_EXECUTION_BG_HEIGHT_PX = 20;
const PCT_EXECUTION_BG_RADIUS_PX = 5;

const EVENT_DURATION_OFFSET_LEFT_PX = BASE_OFFSET_LEFT_PX + 50;
const EVENT_DURATION_OFFSET_TOP_PX = SECOND_LINE_OFFSET_TOP_PX;

const EVENT_DURATION_BG_OFFSET_LEFT_PX = EVENT_DURATION_OFFSET_LEFT_PX - 4;
const EVENT_DURATION_BG_OFFSET_TOP_PX = EVENT_DURATION_OFFSET_TOP_PX - 15;
const EVENT_DURATION_BG_WIDTH_PX = 106;
const EVENT_DURATION_BG_HEIGHT_PX = 20;
const EVENT_DURATION_BG_RADIUS_PX = 5;

const EVENTS_PER_SECOND_OFFSET_LEFT_PX = BASE_OFFSET_LEFT_PX + 160;
const EVENTS_PER_SECOND_OFFSET_TOP_PX = SECOND_LINE_OFFSET_TOP_PX;

const ICON_HEIGHT_PX = 18;
const ICON_WIDTH_PX = 18;

const NO_ID_ICON_OFFSET_LEFT_PX = 5;
const NO_ID_ICON_OFFSET_TOP_PX = 5;

const ICON_OFFSET_LEFT_PX = BASE_OFFSET_LEFT_PX + 258;
const ICON_OFFSET_TOP_PX = FIRST_LINE_OFFSET_TOP_PX + 9;

function tooltipText(d) {
  const pluginName = d.vertex.name;
  return 'This plugin does not have an ID explicitly specified. '
    + 'Specifying an ID allows you to track differences across pipeline changes. '
    + `You can explicitly specify an ID for this plugin like so:\n\n${pluginName} {\n  id => mySpecialId\n}`;
};

function renderHeader(colaObjects, title, subtitle) {
  const pluginHeader = colaObjects
    .append('text')
    .attr('class', 'lspvHeader')
    .attr('x', BASE_OFFSET_LEFT_PX)
    .attr('y', FIRST_LINE_OFFSET_TOP_PX);

  pluginHeader
    .append('tspan')
    .attr('class', 'lspvVertexTitle')
    .text(title);

  // For plugin vertices, either we have an explicitly-set plugin ID or an
  // auto-generated plugin ID. For explicitly-set plugin IDs, show the ID.
  // For auto-generated plugin IDs, show an info icon urging the user to
  // explicitly set an ID.
  pluginHeader
    .filter(d => {
      const vertex = d.vertex;
      return (vertex instanceof PluginVertex && vertex.hasExplicitId) ||
             (vertex instanceof IfVertex);
    })
    .append('tspan')
    .attr('class', 'lspvVertexSubtitle')
    .text(d => subtitle ? ` (${subtitle(d).display})` : null)
    .append('title')
      .text(d => subtitle ? subtitle(d).complete : null);


  const autoGenIdPluginVertexGroup = colaObjects
    .filter(d => d.vertex instanceof PluginVertex)
    .filter(d => !d.vertex.hasExplicitId);

  autoGenIdPluginVertexGroup
    .each(function () {
      const gEl = d3.select(this);
      const titleEl = gEl.select('.lspvVertexTitle')[0][0];

      gEl
      .append('image')
      .attr('xlink:href', infoIcon)
      .attr('x', titleEl.getComputedTextLength() + (ICON_WIDTH_PX / 2) + NO_ID_ICON_OFFSET_LEFT_PX)
      .attr('y', NO_ID_ICON_OFFSET_TOP_PX)
      .attr('height', ICON_HEIGHT_PX)
      .attr('width', ICON_WIDTH_PX)
      .append('title')
        .text(tooltipText);
    });
}

function renderIcon(selection, icon) {
  selection
    .append('image')
    .attr('xlink:href', icon)
    .attr('x', ICON_OFFSET_LEFT_PX)
    .attr('y', ICON_OFFSET_TOP_PX)
    .attr('height', ICON_HEIGHT_PX)
    .attr('width', ICON_WIDTH_PX);
}

export function enterInputVertex(inputs) {
  renderHeader(
    inputs,
    (d => d.vertex.name),
    (d => d.vertex.subtitle)
  );

  renderIcon(inputs, inputIcon);

  inputs
    .append('text')
    .attr('class', 'lspvStat')
    .attr('data-lspv-events-per-second', '')
    .attr('x', BASE_OFFSET_LEFT_PX)
    .attr('y', SECOND_LINE_OFFSET_TOP_PX);
}

export function enterProcessorVertex(processors) {
  renderHeader(
    processors,
    (d => d.vertex.name),
    (d => d.vertex.subtitle)
  );

  processors
    .append('rect')
      .attr('data-lspv-percent-execution-bg', '')
      .attr('x', PCT_EXECUTION_BG_OFFSET_LEFT_PX)
      .attr('y', PCT_EXECUTION_BG_OFFSET_TOP_PX)
      .attr('width', PCT_EXECUTION_BG_WIDTH_PX)
      .attr('height', PCT_EXECUTION_BG_HEIGHT_PX)
      .attr('ry', PCT_EXECUTION_BG_RADIUS_PX)
      .attr('rx', PCT_EXECUTION_BG_RADIUS_PX)
      .attr('fill', 'none');

  processors
    .append('text')
      .attr('class', 'lspvStat')
      .attr('data-lspv-percent-execution', '')
      .attr('x', PCT_EXECUTION_OFFSET_LEFT_PX)
      .attr('y', PCT_EXECUTION_OFFSET_TOP_PX);

  processors
    .append('rect')
      .attr('data-lspv-per-event-duration-in-millis-bg', '')
      .attr('x', EVENT_DURATION_BG_OFFSET_LEFT_PX)
      .attr('y', EVENT_DURATION_BG_OFFSET_TOP_PX)
      .attr('width', EVENT_DURATION_BG_WIDTH_PX)
      .attr('height', EVENT_DURATION_BG_HEIGHT_PX)
      .attr('ry', EVENT_DURATION_BG_RADIUS_PX)
      .attr('rx', EVENT_DURATION_BG_RADIUS_PX)
      .attr('fill', 'none');

  processors
    .append('text')
    .attr('class', 'lspvStat')
    .attr('data-lspv-per-event-duration-in-millis', '')
    .attr('x', EVENT_DURATION_OFFSET_LEFT_PX)
    .attr('y', EVENT_DURATION_OFFSET_TOP_PX);

  processors
    .append('text')
    .attr('class', 'lspvStat')
    .attr('data-lspv-events-per-second', '')
    .attr('x', EVENTS_PER_SECOND_OFFSET_LEFT_PX)
    .attr('y', EVENTS_PER_SECOND_OFFSET_TOP_PX);

  renderIcon(processors, d => d.vertex.pluginType === 'filter' ? filterIcon : outputIcon);
}

export function enterIfVertex(ifs) {
  renderHeader(
    ifs,
    'if',
    (d => d.vertex.subtitle)
  );

  renderIcon(ifs, ifIcon);
}

export function enterQueueVertex(queueVertex) {
  renderHeader(
    queueVertex,
    'queue'
  );

  renderIcon(queueVertex, queueIcon);
}

export function updateInputVertex(inputs) {
  inputs.selectAll('[data-lspv-events-per-second]')
    .text(d => {
      const v = d.vertex.eventsPerSecond;
      return v ? v.toFixed(1) + 'e/s' : 'No Data';
    });
}

export function updateProcessorVertex(processors) {
  processors.selectAll('[data-lspv-percent-execution]')
    .text(d => {
      const pct = d.vertex.percentOfTotalProcessorTime || 0;
      return numeral(pct).format('0%');
    });

  processors.selectAll('[data-lspv-percent-execution-bg]')
    .attr('fill', d => {
      return d.vertex.isTimeConsuming() ? 'orange' : 'none';
    });

  processors.selectAll('[data-lspv-per-event-duration-in-millis]')
    .text(d => {
      const v = d.vertex.millisPerEvent;
      return v ? numeral(v).format('0.00a') + ' ms/e' : 'No Data';
    });

  processors.selectAll('[data-lspv-per-event-duration-in-millis-bg]')
    .attr('fill', d => {
      return d.vertex.isSlow() ? 'orange' : 'none';
    });

  processors.selectAll('[data-lspv-events-per-second]')
    .text(d => {
      const v = d.vertex.eventsPerSecond;
      return v ? numeral(v).format('0.0 a') + ' e/s' : 'No Data';
    });
}
