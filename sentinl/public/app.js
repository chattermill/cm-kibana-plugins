/*
 * Copyright 2016, Lorenzo Mangani (lorenzo.mangani@gmail.com)
 * Copyright 2015, Rao Chenlin (rao.chenlin@gmail.com)
 *
 * This file is part of Sentinl (http://github.com/sirensolutions/sentinl)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* ATTENTION! All UI modules are inserted dynamically. Do not add modules manually in this file! */
import 'ui/kbn_top_nav';
import 'ui/listen';
import 'ui/courier';
import 'ui/modals';
import 'ui/react_components';
import 'angular-touch';
import 'angular-ui-bootstrap';
import 'ui/timepicker';
import 'ui/timefilter';
import 'chart.js';
import 'angular-chart.js';
import './style/main.less';
import 'ui/autoload/styles';
import 'font-awesome/css/font-awesome.css';
import 'bootstrap/dist/js/bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import './app.module';
import './app.routes';
import './pages/about';
import './pages/alarms';
import './pages/reports';
import './pages/watcher_advanced';
import './pages/watcher_wizard';
import './pages/watchers';
import './filters/date_format.filter.js';
import './filters/limit_text.filter.js';
import './filters/next_schedule_occurrence.filter.js';
import './services/alarm_service';
import './services/data_transfer';
import './services/get_notifier';
import './services/get_timefilter';
import './services/get_toast_notifications';
import './services/nav_menu';
import './services/report_service';
import './services/sentinl_helper';
import './services/sentinl_log';
import './services/user_service';
import './services/watcher_service';
import './constants/api.js';
import './constants/common.js';
import './constants/email_watcher.js';
import './constants/email_watcher_advanced.js';
import './constants/email_watcher_dashboard.js';
import './constants/email_watcher_wizard.js';
import './constants/report_watcher.js';
import './directives/mustache_template_input';
import './directives/pop_over';
import './directives/top_nav';
