const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

function initMobileMenu() {
    const button = $('[data-menu-button]');
    const panel = $('[data-mobile-panel]');
    if (!button || !panel) {
        return;
    }
    button.addEventListener('click', () => {
        panel.classList.toggle('is-open');
    });
}

function initHero() {
    const hero = $('[data-hero]');
    if (!hero) {
        return;
    }
    const slides = $$('[data-hero-slide]', hero);
    const dots = $$('[data-hero-dot]', hero);
    const prev = $('[data-hero-prev]', hero);
    const next = $('[data-hero-next]', hero);
    if (!slides.length) {
        return;
    }
    let index = 0;
    let timer = null;

    const show = (nextIndex) => {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
        dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
    };

    const go = (step) => {
        show(index + step);
    };

    const start = () => {
        stop();
        timer = window.setInterval(() => go(1), 5200);
    };

    const stop = () => {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    };

    prev?.addEventListener('click', () => {
        go(-1);
        start();
    });
    next?.addEventListener('click', () => {
        go(1);
        start();
    });
    dots.forEach((dot) => {
        dot.addEventListener('click', () => {
            show(Number(dot.dataset.heroDot || 0));
            start();
        });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
}

function normalize(value) {
    return String(value || '').trim().toLowerCase();
}

function initFilters() {
    const panel = $('[data-filter-panel]');
    const results = $('[data-filter-results]');
    if (!panel || !results) {
        return;
    }
    const input = $('[data-filter-input]', panel);
    const type = $('[data-filter-type]', panel);
    const year = $('[data-filter-year]', panel);
    const count = $('[data-result-count]');
    const cards = $$('[data-movie-card]', results);

    const filter = () => {
        const keyword = normalize(input?.value);
        const typeValue = normalize(type?.value);
        const yearValue = normalize(year?.value);
        let visible = 0;
        cards.forEach((card) => {
            const text = normalize([
                card.dataset.title,
                card.dataset.region,
                card.dataset.type,
                card.dataset.year,
                card.dataset.genre,
                card.textContent,
            ].join(' '));
            const typeOk = !typeValue || normalize(card.dataset.type).includes(typeValue);
            const yearOk = !yearValue || normalize(card.dataset.year) === yearValue;
            const keywordOk = !keyword || text.includes(keyword);
            const show = typeOk && yearOk && keywordOk;
            card.classList.toggle('is-hidden', !show);
            if (show) {
                visible += 1;
            }
        });
        if (count) {
            count.textContent = `${visible} 部`;
        }
    };

    [input, type, year].forEach((control) => {
        control?.addEventListener('input', filter);
        control?.addEventListener('change', filter);
    });
    filter();
}

function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    }[character]));
}

function cardTemplate(movie) {
    const id = Number(movie.id) || 0;
    const title = escapeHtml(movie.title);
    const cover = escapeHtml(movie.cover);
    const oneLine = escapeHtml(movie.one_line);
    const region = escapeHtml(movie.region);
    const type = escapeHtml(movie.type);
    const year = escapeHtml(movie.year);
    const genre = escapeHtml(movie.genre);
    return `
        <article class="search-result-card">
            <a href="./movie-${id}.html">
                <img src="${cover}" alt="${title}" loading="lazy">
            </a>
            <div>
                <h2><a href="./movie-${id}.html">${title}</a></h2>
                <p>${oneLine}</p>
                <div class="meta-row">
                    <span>${region}</span>
                    <span>${type}</span>
                    <span>${year}</span>
                    <span>${genre}</span>
                </div>
            </div>
            <a class="rank-action" href="./movie-${id}.html">播放</a>
        </article>`;
}

function initSearchPage() {
    const page = $('[data-search-page]');
    if (!page) {
        return;
    }
    const input = $('[data-search-input]', page);
    const output = $('[data-search-results]', page);
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';
    if (input) {
        input.value = initialQuery;
    }

    let movies = [];
    const render = () => {
        const query = normalize(input?.value);
        if (!query) {
            output.innerHTML = '<div class="search-tips">请输入关键词开始搜索。</div>';
            return;
        }
        const terms = query.split(/\s+/).filter(Boolean);
        const matched = movies.filter((movie) => {
            const text = normalize([
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                movie.tags.join(' '),
                movie.one_line,
            ].join(' '));
            return terms.every((term) => text.includes(term));
        }).slice(0, 120);

        output.innerHTML = matched.length
            ? matched.map(cardTemplate).join('')
            : '<div class="search-tips">没有找到匹配影片，请换一个关键词。</div>';
    };

    fetch('./assets/movies-index.json')
        .then((response) => response.json())
        .then((data) => {
            movies = Array.isArray(data) ? data : [];
            render();
        })
        .catch(() => {
            output.innerHTML = '<div class="search-tips">搜索数据暂时无法加载。</div>';
        });

    input?.addEventListener('input', render);
}

initMobileMenu();
initHero();
initFilters();
initSearchPage();
