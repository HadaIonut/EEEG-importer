const loading = (context) => {
    const $loading = $('#loading');
    const $loadingBar = $loading.find('#loading-bar');
    const $context = $loadingBar.find('#context');
    const $progress = $loadingBar.find('#progress');
    $context.text(context || '');

    return (min) => (max) => () => {
        if (min >= max) {
            $loading.fadeOut();
            return;
        }

        const percentage = Math.min(Math.floor(min * 100 / max), 100);
        $loading.fadeIn();
        $progress.text(`${percentage}%`);
        $loadingBar.css('width', `${percentage}%`);

        ++min;
    }
}

export {loading}