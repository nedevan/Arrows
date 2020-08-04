/***
 * 
 * @link http://michael.verhov.com/ru/post/canvas_arrows_for_div
 * 
 * @update 25.10.2020
 * 
 */
(function (window, undefined) {

    // Конструктор
    var $cArrows = function(commonParent, genrealOptions) {

		if(window === this) return new $cArrows(commonParent, genrealOptions);

        // Дефолтные настройки  (Можно добавить свои)
		this.options = {
		    base: {
		        canvasZIndex: -10,
		        alertErrors: true,
		        putToContainer: true
		    },
            arrow: {
                connectionType: 'rectangleAuto', // rectangleAuto | center | ellipseAuto | side | rectangleAngle | ellipseAngle
                arrowType: 'arrow',              // arrow | line | double-headed
                arrowSize: 9,
                arrowLineType: 'line'            // line | flex_line
            },
            render: {
                lineWidth: 2,
                strokeStyle: '#2D6CA2'
            }
        };
        
        // Массив 3х массивов. Первый массив нужен для Объектов, второй для канваса, третий для стрелок 
        // stack for: [0] - for common nodes; [1] - for canvas; [2] - for drawn arrows [from, to, options]
		this.CanvasStorage = [[], [], []];

        // Проверяем родителя
		if (typeof commonParent === 'string') {

		    var commonParentResult = document.querySelectorAll(commonParent);
        }
        
		else this.trowException('common parent must be specified');

		if(commonParentResult.length > 0) {

		    for (var i = 0; i < commonParentResult.length; i++) {
		        this.CanvasStorage[0][i] = commonParentResult[i];
            }
            
		    this.CanvasStorage[0].length = commonParentResult.length;
        }
        
		else this.trowException('common parent not found');

        // Добавляем настройки
		if (genrealOptions !== undefined) {

            if (genrealOptions.base !== undefined) extend(this.options.base, genrealOptions.base);
            
            if (genrealOptions.render !== undefined) extend(this.options.render, genrealOptions.render);
            
		    if (genrealOptions.arrow !== undefined) extend(this.options.arrow, genrealOptions.arrow);
		}

        // set up canvas for each node
		for (iParent in this.CanvasStorage[0]) {

            this.CanvasStorage[0][iParent].style.position = 'relative';
            
            var canvas = document.createElement('canvas');
            
		    canvas.innerHTML = "";
		    canvas.style.position = 'absolute';
		    canvas.style.left = '0px';
		    canvas.style.top = '0px';
		    canvas.style.zIndex = this.options.base.canvasZIndex;
		    canvas.width = this.CanvasStorage[0][iParent].scrollWidth;
		    canvas.height = this.CanvasStorage[0][iParent].scrollHeight;

		    // set identifier, if necessary
            if (this.options['canvasId'] !== undefined) {    // && commonParentResult.length === 1
                
		        canvas.id = this.options['canvasId'];
            }
            
		    if (this.options['canvasClass'] !== undefined) {

		        canvas.className = this.options['canvasClass'];
		    }

		    this.CanvasStorage[0][iParent].insertBefore(canvas, this.CanvasStorage[0][iParent].firstChild);
		    this.CanvasStorage[1].push(canvas);
		}

		return this;
    };

    // Добавляет опции к существующим опциям стрелки, если такихопций нет
    function extend(target, source) {

        if(target != null && source != null) {

            for (name in source) {

                if(source[name] !== undefined) target[name] = source[name];
            }
        }

        return target;
    }

    // Получить top left width height объекта (div или другого)
    function getOffset(canvas, childrenEl) {

        var canv = canvas.getBoundingClientRect(),
            box = childrenEl.getBoundingClientRect();

            return {
                top: box.top - canv.top,
                left: box.left - canv.left,
                width: childrenEl.offsetWidth,
                height: childrenEl.offsetHeight
            };
    }

    // Получить Радикал из Градусов
    function DegToRad(deg) {
        return deg * (Math.PI / 180);
    }

    // Получить Градус из Радикала
    function RadToDeg(deg) {
        return deg * (180 / Math.PI);
    }

    // Получает координаты стороны side: top | bottom | left | right
    function getSideCoord(coods, side) {

        var x = 0, y = 0;

        switch(side) {

            case 'top':
                x = coods.left + (coods.width / 2);
                y = coods.top;
                break;
            case 'right':
                x = coods.left + coods.width;
                y = coods.top + (coods.height / 2);
                break;
            case 'bottom':
                x = coods.left + (coods.width / 2);
                y = coods.top + coods.height;
                break;
            case 'left':
                x = coods.left;
                y = coods.top + (coods.height / 2);
                break;
            default:    // def: bottom
                x = coods.left + (coods.width / 2);
                y = coods.top + coods.height;
                break;
        }

        return { x: x, y: y }
    }

    // Получить центр
    function getCenterCoord(coods) {

        return {
            x: coods.left + coods.width / 2,
            y: coods.top + (coods.height / 2)
        }
    }

    // Получает координаты треугольника
    function getAngleCoord(r, c, angle) {

        var x, y,
            rAngle = Math.acos(
                Math.sqrt(Math.pow(r.left + r.width - c.x, 2)) /
                Math.sqrt(Math.pow(r.left + r.width - c.x, 2) + Math.pow(r.top - c.y, 2))
                );

        if (angle >= 2 * Math.PI - rAngle || angle < rAngle) {

            x = r.left + r.width;
            y = c.y + Math.tan(angle) * (r.left + r.width - c.x);
        } 
        
        else {

            if (angle >= rAngle && angle < Math.PI- rAngle) {
                x = c.x - ((r.top - c.y) / Math.tan(angle));
                y = r.top + r.height;
            } 
            
            else {

                if (angle >= Math.PI - rAngle && angle < Math.PI + rAngle) {
                    x = r.left;
                    y = c.y - Math.tan(angle) * (r.left + r.width - c.x);
                }

                else {

                    if (angle >= Math.PI + rAngle) {

                        x = c.x + ((r.top - c.y) / Math.tan(angle));
                        y = r.top;
                    }
                }
            }       
        }

        return {
            x: x,
            y: y
        };
    }

    // Получает координаты круга
    function getEllipseCoord(r, c, angle) {

        return {
            x: c.x + (r.width / 2) * Math.cos(angle),
            y: c.y + (r.height / 2) * Math.sin(angle)
        };
    }

    /**
     * Кончик стрелы
     * 
     * @param {object} context - Контекст конваса
     * 
     * @param {object} p1 - Координаты стартовой точки
     * 
     * @param {object} p2 - Координаты конечной точки
     * 
     * @param {object} otp - Настройки
     * 
     * @param {bool} revers - Претаскивает кончик стрелы на друго конец, по умолчанию false
     */
    function arrowDrow(context, p1, p2, otp, revers = false) {

        var headlen = otp.arrowSize;
        var angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);

        context.beginPath();

        if(!revers) {

            // Конец пути (кончик стрелки)
            context.moveTo(p2.x - headlen * Math.cos(angle - Math.PI / 6), p2.y - headlen * Math.sin(angle - Math.PI / 6));
            context.lineTo(p2.x, p2.y);
            context.lineTo(p2.x - headlen * Math.cos(angle + Math.PI / 6), p2.y - headlen * Math.sin(angle + Math.PI / 6));
        }
        
        else {

            // Начало пути (кончик стрелки)
            context.moveTo(p1.x + headlen * Math.cos(angle - Math.PI / 6), p1.y + headlen * Math.sin(angle - Math.PI / 6));
            context.lineTo(p1.x, p1.y);
            context.lineTo(p1.x + headlen * Math.cos(angle + Math.PI / 6), p1.y + headlen * Math.sin(angle + Math.PI / 6));
        }

        context.stroke();
    }

    /**
     * Рисует линию
     * 
     * https://jsfiddle.net/eqmwLj5z/1/
     * 
     * @param {object} context - Контекст конваса
     * 
     * @param {object} p1 - Координаты стартовой точки
     * 
     * @param {object} p2 - Координаты конечной точки
     * 
     * @param {bool} curve - Делает изгиб, по умолчанию false
     */
    function lineDrow(context, p1, p2, curve = false) {

        context.beginPath();

        var startPoint = { x: p1.x, y: p1.y }

        var lastPoint = { x: p2.x, y: p2.y }

        var centerPoint = { x: lastPoint.x, y: startPoint.y }

        if(!curve) {

            context.moveTo(startPoint.x, startPoint.y);
            context.lineTo(lastPoint.x, lastPoint.y);
        }

        else {

            // Первая часть
            context.moveTo(startPoint.x, startPoint.y);
            context.lineTo(centerPoint.x, centerPoint.y);

            // Вторая часть
            context.moveTo(centerPoint.x, centerPoint.y);
            context.lineTo(lastPoint.x, lastPoint.y);
        }

        context.stroke();
    }

    /**
     * Здесь вызываются модули
     * 
     * @param {object} context - Контекст конваса
     * 
     * @param {object} p1 - Координаты стартовой точки
     * 
     * @param {object} p2 - Координаты конечной точки
     * 
     * @param {object} otp - Настройки
     * 
     * @param {stirng} otp.arrowLineType - Найстройки линии
     * 
     * @param {stirng} otp.arrowType - Найстройки кончика линии
     */
    function canvasDraw(context, p1, p2, otp) {

        switch(otp.arrowLineType) {
            case 'line':
                lineDrow(context, p1, p2);
                break;
            case 'curved-line':
                lineDrow(context, p1, p2, true);
                break;
        }

        switch (otp.arrowType) {
            case 'no-arrow':
                break;
            case 'arrow':
                arrowDrow(context, p1, p2, otp);
                break;
            case 'double-headed':
                arrowDrow(context, p1, p2, otp);
                arrowDrow(context, p1, p2, otp, true);
                break;
            default:
                break;
        }
    }

    // Функция создает на канвасе стрелку. Параметры: color, lineWidth, shadowColor, shadowBlur , div1side, div2side
    function drawArrow(canvas, div1, div2, gRenderOptions, customOptions) {

        var context = canvas.getContext('2d'),
            arrowOpt = {},

            // Координата from
            dot1 = getOffset(canvas, div1),

            // Координата to
            dot2 = getOffset(canvas, div2);

        // extend here with custom
        extend(arrowOpt, gRenderOptions.arrow);
        extend(context, gRenderOptions.render);

        // Добавляем дополнительные настройки для стрелки, если они указаны
        if(customOptions !== undefined) {

            if (customOptions.render !== undefined) extend(context, customOptions.render);

            if (customOptions.arrow !== undefined) extend(arrowOpt, customOptions.arrow);
        }

        // Настрйка подключения стрелки от и до (как подключить стрелку сбоку, снизу и тд)
        switch(arrowOpt.connectionType) {
            case 'rectangleAuto':

                var c1 = getCenterCoord(dot1),
                    c2 = getCenterCoord(dot2);

                dot1 = getAngleCoord(dot1, c1, Math.atan2(c1.y - c2.y, c1.x - c2.x) + Math.PI);
                dot2 = getAngleCoord(dot2, c2, Math.atan2(c2.y - c1.y, c2.x - c1.x) + Math.PI);

                break;
            case 'center':

                dot1 = getCenterCoord(dot1);
                dot2 = getCenterCoord(dot2);

                break;
            case 'ellipseAuto':

                var c1 = getCenterCoord(dot1),
                    c2 = getCenterCoord(dot2);

                dot1 = getEllipseCoord(dot1, c1, Math.atan2(c2.y - c1.y, c2.x - c1.x));
                dot2 = getEllipseCoord(dot2, c2, Math.atan2(c1.y - c2.y, c1.x - c2.x));

                break;
            case 'side':

                dot1 = getSideCoord(dot1, arrowOpt.sideFrom);
                dot2 = getSideCoord(dot2, arrowOpt.sideTo);

                break;
            case 'rectangleAngle':

                dot1 = getAngleCoord(dot1, getCenterCoord(dot1), DegToRad(arrowOpt.angleFrom));
                dot2 = getAngleCoord(dot2, getCenterCoord(dot2), DegToRad(arrowOpt.angleTo));

                break;
            case 'ellipseAngle':

                dot1 = getEllipseCoord(dot1, getCenterCoord(dot1), DegToRad(arrowOpt.angleFrom));
                dot2 = getEllipseCoord(dot2, getCenterCoord(dot2), DegToRad(arrowOpt.angleTo));

                break;
            default: break;
        }

        // Подключение смещения
        if(arrowOpt.startOffsetX != null) dot1.x += arrowOpt.startOffsetX;

        if(arrowOpt.startOffsetY != null) dot1.y += arrowOpt.startOffsetY;

        if(arrowOpt.lastOffsetX != null) dot2.x += arrowOpt.lastOffsetX;

        if(arrowOpt.lastOffsetY != null) dot2.y += arrowOpt.lastOffsetY;

        canvasDraw(context, dot1, dot2, arrowOpt);
    }

    // Заполняем класс функциями
    $cArrows.fn = $cArrows.prototype = {

        trowException: function(ex) {

            if (this.options.base.alertErrors === true) alert('CanvasArrows error: ' + ex);

            throw new Error(ex);
        },

        // Нарисовать стрелку from - от кого, to - куда, customOptions - дополнительные параметры
        arrow: function(from, to, customOptions) {

            // Проходимся по циклу элементов конваса
            for(iParent in this.CanvasStorage[0]) {

                // От кого
                var fromChildrens = this.CanvasStorage[0][iParent].querySelectorAll(from);

                // Куда
                var toChildrens = this.CanvasStorage[0][iParent].querySelectorAll(to);

                for(var fi = 0; fi < fromChildrens.length; fi++) {

                    for(var ti = 0; ti < toChildrens.length; ti++) {

                        // 1 - Канвас, 2 - От кого, 3 - куда, 4 - дефолтные настройки, 5 - мои настройки
                        drawArrow(this.CanvasStorage[1][iParent], fromChildrens[fi], toChildrens[ti], this.options, customOptions);
                    }

                    if(this.options.base.putToContainer === true) this.CanvasStorage[2].push([from, to, customOptions]);
                }
            }

            return this;
        },

        // Рисует массив стрелок, как использовать пока не ясно
        arrows: function (arrowsArr) {

            for (var i = 0; i < arrowsArr.length; i++) {

                this.arrow(arrowsArr[i][0], arrowsArr[i][1], arrowsArr[i][2]);
            }

            return this;
        },

        // Очищает холст
        clear: function () {

            for (iCanvas in this.CanvasStorage[1]) {

                var canvas = this.CanvasStorage[1][iCanvas];

                var context = canvas.getContext('2d');

                context.clearRect(0, 0, canvas.width, canvas.height);
            }

            return this;
        },

        // Рисует ранее созданные стрелки через функцию arrow()
        draw: function () {

            var putToContainer = this.options.base.putToContainer;
            this.options.base.putToContainer = false;

            for (iArrow in this.CanvasStorage[2]) {

                this.arrow(this.CanvasStorage[2][iArrow][0], this.CanvasStorage[2][iArrow][1], this.CanvasStorage[2][iArrow][2]);
            }

            this.options.base.putToContainer = putToContainer;
            
            return this;
        },

        // Перерисовывает стрелки на холсте, эквивалент clear() draw()
        redraw: function () {

            return this.clear().draw();
        },

        // Сменить опции стрелки
        updateOptions: function (options) {

            if (options.base !== undefined) extend(this.options.base, options.base);

            if (options.render !== undefined) extend(this.options.render, options.render);

            if (options.arrow !== undefined) extend(this.options.arrow, options.arrow);

            return this;
        }
	};

	window.$cArrows = $cArrows;
})(window);