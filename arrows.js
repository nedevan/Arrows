/***
 * Библиотека по рисованию стрелок
 *
 * @link http://michael.verhov.com/ru/post/canvas_arrows_for_div
 *
 * @update 25.10.2020
 * @update 16.12.2021
 */
(function (window) {
    /**
     * Arrows
     *
     * @param {String} identifier Идентификатор
     * @param {Object} options Настройки
     * @return {$cArrows}
     */
    const $cArrows = function (identifier, options) {
        if (window === this) {
            return new $cArrows(identifier, options);
        }

        /* Дефолтные настройки (Можно добавить свои) */
        this.defaultOptions = {
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
        // stack for: [0] - for common nodes; [1] - for canvas; [2] - for drawn arrows [from, to, defaultOptions]
        this.CanvasStorage = [[], [], []];

        // Проверяем родителя
        let commonParentResult = [];
        if (typeof identifier === 'string') {
            commonParentResult = document.querySelectorAll(identifier);
        } else {
            this.trowUserException('common parent must be specified');
        }

        if (commonParentResult.length > 0) {
            for (let i = 0; i < commonParentResult.length; i++) {
                this.CanvasStorage[0][i] = commonParentResult[i];
            }

            this.CanvasStorage[0].length = commonParentResult.length;
        } else {
            this.trowUserException('common parent not found');
        }

        /* Добавляем настройки */
        if (typeof options !== "undefined") {
            if (typeof options.base !== "undefined") {
                extend(this.defaultOptions.base, options.base);
            }

            if (typeof options.render !== "undefined") {
                extend(this.defaultOptions.render, options.render);
            }

            if (typeof options.arrow !== "undefined") {
                extend(this.defaultOptions.arrow, options.arrow);
            }
        }

        /* Настроить холст для каждого узла */
        for (const iParent in this.CanvasStorage[0]) {
            this.CanvasStorage[0][iParent].style.position = 'relative';

            const canvas = document.createElement('canvas');

            canvas.innerHTML = "";
            canvas.style.position = 'absolute';
            canvas.style.left = '0px';
            canvas.style.top = '0px';
            canvas.style.zIndex = this.defaultOptions.base.canvasZIndex;
            canvas.width = this.CanvasStorage[0][iParent].scrollWidth;
            canvas.height = this.CanvasStorage[0][iParent].scrollHeight;

            // set identifier, if necessary && commonParentResult.length === 1
            if (typeof this.defaultOptions['canvasId'] !== "undefined") {
                canvas.id = this.defaultOptions['canvasId'];
            }

            if (typeof this.defaultOptions['canvasClass'] !== "undefined") {
                canvas.className = this.defaultOptions['canvasClass'];
            }

            this.CanvasStorage[0][iParent].insertBefore(canvas, this.CanvasStorage[0][iParent].firstChild);
            this.CanvasStorage[1].push(canvas);
        }

        return this;
    };

    /**
     * Обновляет опции настройки
     *
     * @param {Object} currentOptionObject Текущие настройки
     * @param {Object} newOptionObject Новые настройки
     * @return {Object}
     */
    function extend(currentOptionObject, newOptionObject) {
        if (currentOptionObject != null && newOptionObject != null) {
            for (const name in newOptionObject) {
                if (typeof newOptionObject[name] !== "undefined") {
                    currentOptionObject[name] = newOptionObject[name];
                }
            }
        }

        return currentOptionObject;
    }

    /**
     * Получить top left width height объекта (div или другого)
     *
     * @param {HTMLCanvasElement} canvas Канвас
     * @param {HTMLDivElement} childrenEl Элемент
     * @return {{top: number, left: number, width: number, height: number}}
     */
    function getOffset(canvas, childrenEl) {
        const canvasBoundingClientRect = canvas.getBoundingClientRect(),
            box = childrenEl.getBoundingClientRect();

        return {
            top: box.top - canvasBoundingClientRect.top,
            left: box.left - canvasBoundingClientRect.left,
            width: childrenEl.offsetWidth,
            height: childrenEl.offsetHeight
        };
    }

    /**
     * Получить Радикал из Градусов
     *
     * @param {Number} deg Градусы
     * @return {Number}
     */
    function DegToRad(deg) {
        return deg * (Math.PI / 180);
    }

    /**
     * Получает координаты стороны
     *
     * @param {Object} coordinates
     * @param {String} side Сторона top | bottom | left | right
     * @return {Object}
     */
    function getSideCoordinate(coordinates, side) {
        let x, y;
        switch (side) {
            case 'top':
                x = coordinates.left + (coordinates.width / 2);
                y = coordinates.top;
                break;
            case 'right':
                x = coordinates.left + coordinates.width;
                y = coordinates.top + (coordinates.height / 2);
                break;
            case 'bottom':
                x = coordinates.left + (coordinates.width / 2);
                y = coordinates.top + coordinates.height;
                break;
            case 'left':
                x = coordinates.left;
                y = coordinates.top + (coordinates.height / 2);
                break;
            default:    // def: bottom
                x = coordinates.left + (coordinates.width / 2);
                y = coordinates.top + coordinates.height;
                break;
        }

        return {x: x, y: y}
    }

    /**
     * Получить центр
     *
     * @param {Object} coordinates
     * @return {Object}
     */
    function getCenterCoordinate(coordinates) {
        return {
            x: coordinates.left + coordinates.width / 2,
            y: coordinates.top + (coordinates.height / 2)
        }
    }

    /**
     * Получает координаты треугольника
     *
     * @param r
     * @param c
     * @param angle
     * @return {{x, y}}
     */
    function getAngleCoordinate(r, c, angle) {
        const rAngle = Math.acos(
            Math.sqrt(Math.pow(r.left + r.width - c.x, 2)) /
            Math.sqrt(Math.pow(r.left + r.width - c.x, 2) + Math.pow(r.top - c.y, 2))
        );

        let x, y;
        if (angle >= 2 * Math.PI - rAngle || angle < rAngle) {
            x = r.left + r.width;
            y = c.y + Math.tan(angle) * (r.left + r.width - c.x);
        } else {
            if (angle >= rAngle && angle < Math.PI - rAngle) {
                x = c.x - ((r.top - c.y) / Math.tan(angle));
                y = r.top + r.height;
            } else {
                if (angle >= Math.PI - rAngle && angle < Math.PI + rAngle) {
                    x = r.left;
                    y = c.y - Math.tan(angle) * (r.left + r.width - c.x);
                } else {
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

    /**
     * Получает координаты круга
     *
     * @param r
     * @param c
     * @param angle
     * @return {{x: *, y: *}}
     */
    function getEllipseCoordinate(r, c, angle) {
        return {
            x: c.x + (r.width / 2) * Math.cos(angle),
            y: c.y + (r.height / 2) * Math.sin(angle)
        };
    }

    /**
     * Кончик стрелы
     *
     * @param {Object} context Контекст конваса
     * @param {Object} p1 Координаты стартовой точки
     * @param {Object} p2 Координаты конечной точки
     * @param {Object} otp Настройки
     * @param {Boolean} revers Претаскивает кончик стрелы на друго конец, по умолчанию false
     */
    function arrowDraw(context, p1, p2, otp, revers = false) {
        const arrowSize = otp.arrowSize;
        let angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);

        context.beginPath();

        if (!revers) {
            // Конец пути (кончик стрелки)
            context.moveTo(p2.x - arrowSize * Math.cos(angle - Math.PI / 6), p2.y - arrowSize * Math.sin(angle - Math.PI / 6));
            context.lineTo(p2.x, p2.y);
            context.lineTo(p2.x - arrowSize * Math.cos(angle + Math.PI / 6), p2.y - arrowSize * Math.sin(angle + Math.PI / 6));
        } else {
            // Начало пути (кончик стрелки)
            context.moveTo(p1.x + arrowSize * Math.cos(angle - Math.PI / 6), p1.y + arrowSize * Math.sin(angle - Math.PI / 6));
            context.lineTo(p1.x, p1.y);
            context.lineTo(p1.x + arrowSize * Math.cos(angle + Math.PI / 6), p1.y + arrowSize * Math.sin(angle + Math.PI / 6));
        }

        context.stroke();
    }

    /**
     * Рисует линию
     *
     * @link https://jsfiddle.net/eqmwLj5z/1/
     *
     * @param {Object} context Контекст конваса
     * @param {Object} p1 Координаты стартовой точки
     * @param {Object} p2 Координаты конечной точки
     * @param {Boolean} curve Делает изгиб, по умолчанию false
     */
    function lineDraw(context, p1, p2, curve = false) {
        context.beginPath();

        const startPoint = {x: p1.x, y: p1.y}
        const lastPoint = {x: p2.x, y: p2.y}
        const centerPoint = {x: lastPoint.x, y: startPoint.y}

        if (!curve) {
            context.moveTo(startPoint.x, startPoint.y);
            context.lineTo(lastPoint.x, lastPoint.y);
        } else {
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
     * @param {Object} context Контекст конваса
     * @param {Object} p1 Координаты стартовой точки
     * @param {Object} p2 Координаты конечной точки
     * @param {Object} otp Настройки
     * @param {String} otp.arrowLineType Найстройки линии
     * @param {String} otp.arrowType Найстройки кончика линии
     */
    function canvasDraw(context, p1, p2, otp) {
        switch (otp.arrowLineType) {
            case 'line':
                lineDraw(context, p1, p2);
                break;
            case 'curved-line':
                lineDraw(context, p1, p2, true);
                break;
        }

        switch (otp.arrowType) {
            case 'no-arrow':
                break;
            case 'arrow':
                arrowDraw(context, p1, p2, otp);
                break;
            case 'double-headed':
                arrowDraw(context, p1, p2, otp);
                arrowDraw(context, p1, p2, otp, true);
                break;
            default:
                break;
        }
    }

    /**
     * Создает на канвасе стрелку
     *
     * @param canvas
     * @param div1
     * @param div2
     * @param gRenderOptions
     * @param customOptions
     */
    function drawArrow(canvas, div1, div2, gRenderOptions, customOptions) {
        let context = canvas.getContext('2d'),
            /**
             * @type {ArrowOptions} Настройки стрелки
             */
            arrowOptions = {},

            /* Координата from */
            dot1 = getOffset(canvas, div1),

            /* Координата to */
            dot2 = getOffset(canvas, div2);

        // extend here with custom
        extend(arrowOptions, gRenderOptions.arrow);
        extend(context, gRenderOptions.render);

        /* Добавляем дополнительные настройки для стрелки, если они указаны */
        if (typeof customOptions !== "undefined") {
            if (typeof customOptions.render !== "undefined") {
                extend(context, customOptions.render);
            }

            if (typeof customOptions.arrow !== "undefined") {
                extend(arrowOptions, customOptions.arrow);
            }
        }

        const c1 = getCenterCoordinate(dot1),
            c2 = getCenterCoordinate(dot2);

        /* Настрйка подключения стрелки от и до (как подключить стрелку сбоку, снизу и тд) */
        switch (arrowOptions.connectionType) {
            case 'rectangleAuto':
                dot1 = getAngleCoordinate(dot1, c1, Math.atan2(c1.y - c2.y, c1.x - c2.x) + Math.PI);
                dot2 = getAngleCoordinate(dot2, c2, Math.atan2(c2.y - c1.y, c2.x - c1.x) + Math.PI);

                break;
            case 'center':
                dot1 = getCenterCoordinate(dot1);
                dot2 = getCenterCoordinate(dot2);

                break;
            case 'ellipseAuto':
                dot1 = getEllipseCoordinate(dot1, c1, Math.atan2(c2.y - c1.y, c2.x - c1.x));
                dot2 = getEllipseCoordinate(dot2, c2, Math.atan2(c1.y - c2.y, c1.x - c2.x));

                break;
            case 'side':
                dot1 = getSideCoordinate(dot1, arrowOptions.sideFrom);
                dot2 = getSideCoordinate(dot2, arrowOptions.sideTo);

                break;
            case 'rectangleAngle':
                dot1 = getAngleCoordinate(dot1, getCenterCoordinate(dot1), DegToRad(arrowOptions.angleFrom));
                dot2 = getAngleCoordinate(dot2, getCenterCoordinate(dot2), DegToRad(arrowOptions.angleTo));

                break;
            case 'ellipseAngle':
                dot1 = getEllipseCoordinate(dot1, getCenterCoordinate(dot1), DegToRad(arrowOptions.angleFrom));
                dot2 = getEllipseCoordinate(dot2, getCenterCoordinate(dot2), DegToRad(arrowOptions.angleTo));

                break;
            default:
                break;
        }

        // Подключение смещения
        if (arrowOptions.startOffsetX != null) {
            dot1.x += arrowOptions.startOffsetX;
        }

        if (arrowOptions.startOffsetY != null) {
            dot1.y += arrowOptions.startOffsetY;
        }

        if (arrowOptions.lastOffsetX != null) {
            dot2.x += arrowOptions.lastOffsetX;
        }

        if (arrowOptions.lastOffsetY != null) {
            dot2.y += arrowOptions.lastOffsetY;
        }

        canvasDraw(context, dot1, dot2, arrowOptions);
    }

    /**
     * Класс Arrows
     */
    $cArrows.fn = $cArrows.prototype = {
        /**
         * Вызвать исключение
         *
         * @param {String|Object} exception
         */
        trowUserException: function (exception) {
            if (this.defaultOptions.base.alertErrors === true) {
                alert("CanvasArrows error: " + exception);
            }

            throw new Error(exception);
        },

        /**
         * Нарисовать стрелку from - от кого, to - куда, options - дополнительные параметры
         *
         * @param {String} from Идентификатор от
         * @param {String} to Идентификатор к
         * @param {Object} options Настройки
         * @return {$cArrows}
         */
        arrow: function (from, to, options) {
            /* Проходимся по циклу элементов конваса */
            for (const iParent in this.CanvasStorage[0]) {
                const fromChildren = this.CanvasStorage[0][iParent].querySelectorAll(from);
                const toChildren = this.CanvasStorage[0][iParent].querySelectorAll(to);

                for (let fi = 0; fi < fromChildren.length; fi++) {
                    for (let ti = 0; ti < toChildren.length; ti++) {
                        /* 1 - Канвас, 2 - От кого, 3 - куда, 4 - дефолтные настройки, 5 - мои настройки */
                        drawArrow(this.CanvasStorage[1][iParent], fromChildren[fi], toChildren[ti], this.defaultOptions, options);
                    }

                    if (this.defaultOptions.base.putToContainer === true) {
                        this.CanvasStorage[2].push([from, to, options]);
                    }
                }
            }

            return this;
        },

        /**
         * Рисует массив стрелок, как использовать пока не ясно
         *
         * @param arrowsArr
         * @return {$cArrows}
         */
        arrows: function (arrowsArr) {
            for (let i = 0; i < arrowsArr.length; i++) {
                this.arrow(arrowsArr[i][0], arrowsArr[i][1], arrowsArr[i][2]);
            }

            return this;
        },

        /**
         * Очищает холст
         *
         * @return {$cArrows}
         */
        clear: function () {
            for (const iCanvas in this.CanvasStorage[1]) {
                const canvas = this.CanvasStorage[1][iCanvas];
                const context = canvas.getContext('2d');

                context.clearRect(0, 0, canvas.width, canvas.height);
            }

            return this;
        },

        /**
         * Рисует ранее созданные стрелки через функцию arrow()
         *
         * @return {$cArrows}
         */
        draw: function () {
            const putToContainer = this.defaultOptions.base.putToContainer;
            this.defaultOptions.base.putToContainer = false;

            for (let iArrow in this.CanvasStorage[2]) {
                this.arrow(this.CanvasStorage[2][iArrow][0], this.CanvasStorage[2][iArrow][1], this.CanvasStorage[2][iArrow][2]);
            }

            this.defaultOptions.base.putToContainer = putToContainer;

            return this;
        },

        /**
         * Перерисовывает стрелки на холсте, эквивалент clear() draw()
         *
         * @return {$cArrows}
         */
        redraw: function () {
            return this.clear().draw();
        },

        /**
         * Сменить опции стрелки
         *
         * @param defaultOptions
         * @return {$cArrows}
         */
        updateOptions: function (defaultOptions) {
            if (typeof defaultOptions.base !== "undefined") {
                extend(this.defaultOptions.base, defaultOptions.base);
            }

            if (typeof defaultOptions.render !== "undefined") {
                extend(this.defaultOptions.render, defaultOptions.render);
            }

            if (typeof defaultOptions.arrow !== "undefined") {
                extend(this.defaultOptions.arrow, defaultOptions.arrow);
            }

            return this;
        }
    };

    window.$cArrows = $cArrows;
})(window);

/**
 * ArrowOptions
 *
 * @typedef {Object} ArrowOptions
 * @property {String} connectionType Тип подключения: rectangleAuto | center | ellipseAuto | side | rectangleAngle | ellipseAngle
 * @property {String} arrowType Определяет тип стрелки: arrow | line | double-headed
 * @property {Number} arrowSize Размер стрелки
 * @property {String} arrowLineType Тип линии: line | flex_line
 * @property {String} sideFrom
 * @property {String} sideTo
 * @property {Number} angleFrom
 * @property {Number} angleTo
 * @property {Number} startOffsetX
 * @property {Number} startOffsetY
 * @property {Number} lastOffsetX
 * @property {Number} lastOffsetY
 */