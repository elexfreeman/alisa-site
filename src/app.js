import './scss/base.scss';

import angular from 'angular';
import CatalogController from './controllers/CatalogController';

angular.module('app.catalog', [])
    .controller('CatalogController', CatalogController).name;





