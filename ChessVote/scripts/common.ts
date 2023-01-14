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
    url: string
}): Promise<any> {
    return new Promise((resolve, reject) => {
        var request = new XMLHttpRequest();
        request.open(data.method, data.url, true);
        request.responseType = 'json';
        request.onload = function () {
            if (this.status >= 200 && this.status < 400) {
                resolve(this.response);
            } else {
                toastr.warning("Произошла ошибка (код ошибки 2)");
                reject();
            }
        };

        request.onerror = function () {
            toastr.warning("Произошла ошибка (код ошибки 3)");
            reject();
        };

        request.send();
    });
}