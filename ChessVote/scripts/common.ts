
import * as toastr from "toastr"

export function ready(fn) {
    if (document.readyState != 'loading') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

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
                toastr.warning("Произошла ошибка");
                return;
            }
            data.onError();

        }
    };

    request.onerror = function () {
        if (data.onError == null) {
            toastr.warning("Произошла ошибка");
            return;
        }
        data.onError();
    };

    request.send();


}