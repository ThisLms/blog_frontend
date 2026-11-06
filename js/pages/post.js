'use strict';

const postWriteForm = document.querySelector('#post-write-form');
const postWriteTitle = document.querySelector('#post-write-title');
const postWriteCategory = document.querySelector('#post-write-category');
const postWriteMarkdown = document.querySelector('#post-write-markdown');
const postWritePreview = document.querySelector('#post-write-preview');
const postWriteError = document.querySelector('#post-write-error');
const postWriteClear = document.querySelector('#post-write-clear');

function showPostWriteError(message) {
    postWriteError.textContent = message;
    postWriteError.hidden = !message;
}

const postWriteEditFields = document.querySelector('#post-write-edit-fields');
const postWriteEditTab = document.querySelector('#post-write-edit-tab');
const postWritePreviewTab = document.querySelector('#post-write-preview-tab');
const postWriteEditPanel = document.querySelector('#post-write-edit-panel');
const postWritePreviewPanel = document.querySelector('#post-write-preview-panel');
const postWritePreviewTitle = document.querySelector('#post-write-preview-title');
const postWritePreviewCategory = document.querySelector('#post-write-preview-category');
const postWritePreviewTags = document.querySelector('#post-write-preview-tags');

function renderPostWritePreview() {
    postWritePreviewTitle.textContent = postWriteTitle.value.trim() || '無題の投稿';
    postWritePreviewCategory.textContent = postWriteCategory.selectedOptions[0]?.textContent || '';
    postWritePreviewCategory.hidden = !postWriteCategory.value;
    postWritePreviewTags.replaceChildren();
    for (const id of postWriteSelectedIds) {
        const tag = postWriteAvailableTags.find(item => item.id === id);
        if (!tag) continue;
        const chip = document.createElement('span');
        chip.className = 'post-write-preview-tag';
        chip.textContent = '#' + tag.name;
        postWritePreviewTags.append(chip);
    }
    const markdown = postWriteMarkdown.value;
    if (!markdown.trim()) {
        postWritePreview.textContent = '本文が入力されていません。';
        return;
    }
    if (typeof marked === 'undefined' || typeof DOMPurify === 'undefined') {
        postWritePreview.textContent = 'プレビュー用ライブラリを読み込めませんでした。';
        return;
    }
    const html = marked.parse(markdown, { gfm: true, breaks: false, async: false });
    postWritePreview.innerHTML = DOMPurify.sanitize(html);
    postWritePreview.querySelectorAll('a[href]').forEach(link => {
        const href = link.getAttribute('href') || '';
        if (/^https?:\/\//i.test(href)) {
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
        }
    });
}

function setPostWriteMode(mode, focusTab = false) {
    const preview = mode === 'preview';
    if (preview) renderPostWritePreview();
    postWriteEditFields.hidden = preview;
    postWriteEditPanel.hidden = preview;
    postWritePreviewPanel.hidden = !preview;
    postWriteEditTab.setAttribute('aria-selected', String(!preview));
    postWritePreviewTab.setAttribute('aria-selected', String(preview));
    postWriteEditTab.tabIndex = preview ? -1 : 0;
    postWritePreviewTab.tabIndex = preview ? 0 : -1;
    if (focusTab) (preview ? postWritePreviewTab : postWriteEditTab).focus();
}
postWriteEditTab.addEventListener('click', () => setPostWriteMode('edit'));
postWritePreviewTab.addEventListener('click', () => setPostWriteMode('preview'));
for (const tab of [postWriteEditTab, postWritePreviewTab]) {
    tab.addEventListener('keydown', event => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        setPostWriteMode(tab === postWriteEditTab ? 'preview' : 'edit', true);
    });
}

// 백엔드 연결 전에는 아래 예시 태그를 사용합니다. 실제 DB 저장은 하지 않습니다.
const POST_WRITE_TAGS_API = null; // 연결 후 예: '/api/tags' (GET)
const postWriteDemoTags = [
    { id: 1, name: 'Python' }, { id: 2, name: 'JavaScript' },
    { id: 3, name: 'FastAPI' }, { id: 4, name: 'Flask' },
    { id: 5, name: 'JWT' }, { id: 6, name: 'MySQL' },
    { id: 7, name: 'REST API' }, { id: 8, name: 'Docker' }
];
const postWriteTagDialog = document.querySelector('#post-write-tag-dialog');
const postWriteTagSearch = document.querySelector('#post-write-tag-search');
const postWriteTagOptions = document.querySelector('#post-write-tag-options');
const postWriteTagStatus = document.querySelector('#post-write-tag-status');
const postWriteTagCount = document.querySelector('#post-write-tag-count');
const postWriteSelectedTags = document.querySelector('#post-write-selected-tags');
const postWriteOpenTags = document.querySelector('#post-write-open-tags');
const postWriteApplyTags = document.querySelector('#post-write-apply-tags');
const postWriteCancelTags = document.querySelector('#post-write-cancel-tags');
const postWriteCloseTags = document.querySelector('#post-write-close-tags');
const POST_WRITE_MAX_TAGS = 5;
let postWriteAvailableTags = [];
let postWriteSelectedIds = [];
let postWriteDraftIds = [];

function renderSelectedTags() {
    postWriteSelectedTags.replaceChildren();
    if (!postWriteSelectedIds.length) {
        const empty = document.createElement('span');
        empty.className = 'post-write-tag-empty';
        empty.textContent = '선택된 태그가 없습니다.';
        postWriteSelectedTags.append(empty);
        return;
    }
    for (const id of postWriteSelectedIds) {
        const tag = postWriteAvailableTags.find(item => item.id === id);
        if (!tag) continue;
        const chip = document.createElement('span');
        chip.className = 'post-write-tag-chip';
        chip.append(document.createTextNode('#' + tag.name));
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'post-write-tag-remove';
        remove.textContent = '×';
        remove.setAttribute('aria-label', tag.name + ' 태그 제거');
        remove.addEventListener('click', () => {
            postWriteSelectedIds = postWriteSelectedIds.filter(value => value !== id);
            renderSelectedTags();
            if (!postWritePreviewPanel.hidden) renderPostWritePreview();
        });
        chip.append(remove);
        postWriteSelectedTags.append(chip);
    }
}

function renderTagOptions() {
    postWriteTagOptions.replaceChildren();
    const query = postWriteTagSearch.value.trim().toLocaleLowerCase();
    const filtered = postWriteAvailableTags.filter(tag => tag.name.toLocaleLowerCase().includes(query));
    for (const tag of filtered) {
        const selected = postWriteDraftIds.includes(tag.id);
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'post-write-tag-option';
        button.textContent = (selected ? '✓ ' : '') + tag.name;
        button.setAttribute('aria-pressed', String(selected));
        button.disabled = !selected && postWriteDraftIds.length >= POST_WRITE_MAX_TAGS;
        button.addEventListener('click', () => {
            postWriteDraftIds = selected
                ? postWriteDraftIds.filter(id => id !== tag.id)
                : [...postWriteDraftIds, tag.id];
            renderTagOptions();
        });
        postWriteTagOptions.append(button);
    }
    if (!filtered.length) {
        const empty = document.createElement('span');
        empty.className = 'post-write-tag-empty';
        empty.textContent = '검색 결과가 없습니다.';
        postWriteTagOptions.append(empty);
    }
    postWriteTagCount.textContent = `${postWriteDraftIds.length} / ${POST_WRITE_MAX_TAGS}개 선택`;
}

async function loadPostWriteTags() {
    if (!POST_WRITE_TAGS_API) return postWriteDemoTags;
    const response = await fetch(POST_WRITE_TAGS_API, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`태그 목록 조회 실패 (${response.status})`);
    const data = await response.json();
    // API 응답 형식: [{id: 1, name: 'Python'}, ...]
    if (!Array.isArray(data) || !data.every(tag => Number.isSafeInteger(tag.id) && tag.id > 0 && typeof tag.name === 'string' && tag.name.trim())) {
        throw new Error('태그 API 응답 형식이 올바르지 않습니다.');
    }
    if (new Set(data.map(tag => tag.id)).size !== data.length) throw new Error('태그 ID가 중복되었습니다.');
    return data;
}

postWriteOpenTags.addEventListener('click', async () => {
    postWriteDraftIds = [...postWriteSelectedIds];
    postWriteTagSearch.value = '';
    postWriteTagOptions.replaceChildren();
    postWriteTagStatus.textContent = '태그를 불러오는 중...';
    postWriteApplyTags.disabled = true;
    postWriteTagDialog.showModal();
    postWriteTagSearch.focus();
    try {
        postWriteAvailableTags = await loadPostWriteTags();
        if (!postWriteTagDialog.open) return;
        const validIds = new Set(postWriteAvailableTags.map(tag => tag.id));
        postWriteDraftIds = postWriteDraftIds.filter(id => validIds.has(id));
        postWriteTagStatus.textContent = POST_WRITE_TAGS_API ? '등록된 태그를 선택해 주세요.' : '예시 태그 목록입니다. API 연결 전에는 DB를 조회하지 않습니다.';
        postWriteApplyTags.disabled = false;
        renderTagOptions();
    } catch (error) {
        if (postWriteTagDialog.open) postWriteTagStatus.textContent = error.message;
    }
});
postWriteTagSearch.addEventListener('input', renderTagOptions);
postWriteApplyTags.addEventListener('click', () => {
    postWriteSelectedIds = [...postWriteDraftIds];
    renderSelectedTags();
    if (!postWritePreviewPanel.hidden) renderPostWritePreview();
    postWriteTagDialog.close();
});
postWriteCancelTags.addEventListener('click', () => postWriteTagDialog.close());
postWriteCloseTags.addEventListener('click', () => postWriteTagDialog.close());

postWriteMarkdown.addEventListener('input', () => { if (!postWritePreviewPanel.hidden) renderPostWritePreview(); });
postWriteForm.addEventListener('input', () => showPostWriteError(''));

postWriteClear.addEventListener('click', () => {
    if (!window.confirm('작성 중인 내용을 모두 초기화할까요?')) return;
    postWriteForm.reset();
    postWriteSelectedIds = [];
    renderSelectedTags();
    showPostWriteError('');
    setPostWriteMode('edit');
    renderPostWritePreview();
    postWriteTitle.focus();
});

postWriteForm.addEventListener('submit', event => {
    event.preventDefault();
    const title = postWriteTitle.value.trim();
    const category = postWriteCategory.value;
    const content = postWriteMarkdown.value.trim();
    if (!title) { setPostWriteMode('edit'); showPostWriteError('タイトルを入力してください。'); postWriteTitle.focus(); return; }
    if (!category) { setPostWriteMode('edit'); showPostWriteError('カテゴリーを選択してください。'); postWriteCategory.focus(); return; }
    if (!content) { setPostWriteMode('edit'); showPostWriteError('本文を入力してください。'); postWriteMarkdown.focus(); return; }
    if (typeof marked === 'undefined' || typeof DOMPurify === 'undefined') {
        showPostWriteError('Markdownライブラリを読み込めませんでした。'); return;
    }
    // 서버 연결 시 태그 ID 존재 여부, 권한, 최대 개수 등을 서버에서도 검증해야 합니다.
    const payload = { title, category, tag_ids: [...postWriteSelectedIds], content };
    console.log('게시글 작성 API 연결 전 데이터:', payload);
    showPostWriteError('入力内容を確認しました。投稿APIはまだ接続されていないため、保存されていません。');
});

renderSelectedTags();
setPostWriteMode('edit');
renderPostWritePreview();
