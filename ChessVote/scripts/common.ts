import * as toastr from "toastr"

/**
 * Выполнить указанную функцию после загрузки страницы
 * @param fn
 */
export function documentReady(fn) {
    if (document.readyState != 'loading') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

/**
 * Выполнить http-запрос
 * @param data
 */
export function send(data: {
    method: string,
    url: string,
    onSuccess?: Function,
    onError?: Function,
}) {
    var request = new XMLHttpRequest();
    request.open(data.method, data.url, true);
    request.responseType = 'json';
    request.onload = function () {
        if (this.status >= 200 && this.status < 400) {
            if (data.onSuccess == null) return;
            data.onSuccess(this.response);
        } else {
            if (data.onError == null) {
                toastr.warning("Произошла ошибка (код ошибки 2)");
                return;
            }
            data.onError();

        }
    };

    request.onerror = function () {
        if (data.onError == null) {
            toastr.warning("Произошла ошибка (код ошибки 3)");
            return;
        }
        data.onError();
    };

    request.send();
}