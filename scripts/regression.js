/**
* @license
*
* Regression.JS - Regression functions for javascript
* http://tom-alexander.github.com/regression-js/
* 
* copyright(c) 2013 Tom Alexander
* Licensed under the MIT license.
*
**/

;(function() {
    'use strict';

    var gaussianElimination = function(a, o) {
        var n = a.length - 1,
            x = new Array(o);
        for (var i = 0; i < n; i++) {
            var maxrow = i;
            for (var j = i + 1; j < n; j++) {
                if (Math.abs(a[i][j]) > Math.abs(a[i][maxrow])) {
                    maxrow = j;}}
            for (var k = i; k < n + 1; k++) {
                var tmp = a[k][i];
                a[k][i] = a[k][maxrow];
                a[k][maxrow] = tmp;}
            for (var j = i + 1; j < n; j++) {
                for (k = n; k >= i; k--) {
                    a[k][j] -= a[k][i] * a[i][j] / a[i][i];}}}
        for (var j = n - 1; j >= 0; j--) {
            var tmp = 0;
            for (var k = j + 1; k < n; k++) {
                tmp += a[k][j] * x[k];}
            x[j] = (a[n][j] - tmp) / a[j][j];}
        return (x);
    };

    var prepare_for_MathJax = function(string) {
        // Add $$ before and after string, replace 'e' notation with '10^'
        // and remove redundant '+' in case it is directly followed by '-'.
        return '$$' + string.replace(/e\+?(-?\d+)/g,'\\cdot10^{$1}')
                            .replace(/\+ -/g, '-') + '$$';
    };

    var methods = {
        linear: function(data) {
            var sum = [0, 0, 0, 0, 0], n = 0, results = [];

            for (; n < data.length; n++) {
                if (data[n][1]) {
                    sum[0] += data[n][0];
                    sum[1] += data[n][1];
                    sum[2] += data[n][0] * data[n][0];
                    sum[3] += data[n][0] * data[n][1];
                    sum[4] += data[n][1] * data[n][1];}}

            var gradient = (n * sum[3] - sum[0] * sum[1]) / (n * sum[2] - sum[0] * sum[0]);
            var intercept = (sum[1] / n) - (gradient * sum[0]) / n;
          //  var correlation = (n * sum[3] - sum[0] * sum[1]) / Math.sqrt((n * sum[2] - sum[0] * sum[0]) * (n * sum[4] - sum[1] * sum[1]));

            for (var i = 0, len = data.length; i < len; i++) {
                var coordinate = [data[i][0], data[i][0] * gradient + intercept];
                results.push(coordinate);}

            var string = 'y = ' + gradient.toExponential(2) + 'x + ' + intercept.toExponential(2);

            // The string needs to be in Tex in order for MathJax to render in propertly, so use regex to do so
            return {equation: [gradient, intercept], points: results, string: prepare_for_MathJax(string)};
        },

        exponential: function(data) {
            var sum = [0, 0, 0, 0, 0, 0], n = 0, results = [];

            for (len = data.length; n < len; n++) {
                if (data[n][1]) {
                    sum[0] += data[n][0];
                    sum[1] += data[n][1];
                    sum[2] += data[n][0] * data[n][0] * data[n][1];
                    sum[3] += data[n][1] * Math.log(data[n][1]);
                    sum[4] += data[n][0] * data[n][1] * Math.log(data[n][1]);
                    sum[5] += data[n][0] * data[n][1];}}

            var denominator = (sum[1] * sum[2] - sum[5] * sum[5]);
            var A = Math.pow(Math.E, (sum[2] * sum[3] - sum[5] * sum[4]) / denominator);
            var B = (sum[1] * sum[4] - sum[5] * sum[3]) / denominator;

            for (var i = 0, len = data.length; i < len; i++) {
                var coordinate = [data[i][0], A * Math.pow(Math.E, B * data[i][0])];
                results.push(coordinate);}

            var string = 'y = ' + A.toExponential(2) + 'e^{' + B.toExponential(2) + 'x}';

            return {equation: [A, B], points: results, string: prepare_for_MathJax(string)};
        },

        logarithmic: function(data) {
            var sum = [0, 0, 0, 0], n = 0, results = [];

            for (len = data.length; n < len; n++) {
                if (data[n][1]) {
                    sum[0] += Math.log(data[n][0]);
                    sum[1] += data[n][1] * Math.log(data[n][0]);
                    sum[2] += data[n][1];
                    sum[3] += Math.pow(Math.log(data[n][0]), 2);}}

            var B = (n * sum[1] - sum[2] * sum[0]) / (n * sum[3] - sum[0] * sum[0]);
            var A = (sum[2] - B * sum[0]) / n;

            for (var i = 0, len = data.length; i < len; i++) {
                var coordinate = [data[i][0], A + B * Math.log(data[i][0])];
                results.push(coordinate);}

            var string = 'y = ' + A.toExponential(2) + ' + ' + B.toExponential(2) + ' ln(x)';

            return {equation: [A, B], points: results, string: prepare_for_MathJax(string)};
        },

        power: function(data) {
            var sum = [0, 0, 0, 0], n = 0, results = [];

            for (len = data.length; n < len; n++) {
                if (data[n][1]) {
                    sum[0] += Math.log(data[n][0]);
                    sum[1] += Math.log(data[n][1]) * Math.log(data[n][0]);
                    sum[2] += Math.log(data[n][1]);
                    sum[3] += Math.pow(Math.log(data[n][0]), 2);}}

            var B = (n * sum[1] - sum[2] * sum[0]) / (n * sum[3] - sum[0] * sum[0]);
            var A = Math.pow(Math.E, (sum[2] - B * sum[0]) / n);

            for (var i = 0, len = data.length; i < len; i++) {
                var coordinate = [data[i][0], A * Math.pow(data[i][0] , B)];
                results.push(coordinate);}

             var string = 'y = ' + A.toExponential(2) + 'x^{' + B.toExponential(2) + '}';

            return {equation: [A, B], points: results, string: prepare_for_MathJax(string)};
        },

        polynomial: function(data, order) {
            if (typeof order == 'undefined') {
                order = 2;
            }
            var lhs = [], rhs = [], results = [],
                a = 0, b = 0,
                k = order + 1;

            for (var i = 0; i < k; i++) {
                for (var l = 0, len = data.length; l < len; l++) {
                    if (data[l][1]) {
                        a += Math.pow(data[l][0], i) * data[l][1];}}
                lhs.push(a);
                a = 0;
                var c = [];
                for (var j = 0; j < k; j++) {
                    for (var l = 0, len = data.length; l < len; l++) {
                        if (data[l][1]) {
                            b += Math.pow(data[l][0], i + j);}}
                    c.push(b);
                    b = 0;}
                rhs.push(c);}
            rhs.push(lhs);

            var equation = gaussianElimination(rhs, k);

            for (var i = 0, len = data.length; i < len; i++) {
                var answer = 0;
                for (var w = 0; w < equation.length; w++) {
                    answer += equation[w] * Math.pow(data[i][0], w);}
                results.push([data[i][0], answer]);}

            var string = 'y = ';

            for (var i = equation.length-1; i >= 0; i--) {
                if (i > 1) string += equation[i].toExponential(2) + 'x^{' + i + '} + ';
                else if (i == 1) string += equation[i].toExponential(2) + 'x' + ' + ';
                else string += equation[i].toExponential(2);}

            return {equation: equation, points: results, string: prepare_for_MathJax(string)};
        },

        lastvalue: function(data) {
            var results = [];
            var lastvalue = null;
            for (var i = 0; i < data.length; i++) {
                if (data[i][1]) {
                    lastvalue = data[i][1];
                    results.push([data[i][0], data[i][1]]);}
                else {
                    results.push([data[i][0], lastvalue]);}}
  
            return {equation: [lastvalue], points: results, string: "" + lastvalue};
        }
    };

var regression = (function(method, data, order) {
    if (typeof method == 'string') {
        return methods[method](data, order);
    }});

if (typeof exports !== 'undefined') {
    module.exports = regression;}
else {
    window.regression = regression;}

}());