// load monaco-editor config
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.20.0/min/vs' }});
require(['vs/editor/editor.main'], function() {
  // init monaco-editor
  const editor = monaco.editor.create(document.getElementById('editor'), {
    value: '',
    language: 'markdown'
  });
  editor.getModel().onDidChangeContent(debounce(() => {
    const content = editor.getValue();
    if (content) {
      setDlBtnDisabled(false);
      convert(content, getCurrentView());
    } else {
      setDlBtnDisabled(true);
    }
  }, 1000));

  // init event listner
  const downloadBtn = document.getElementById('download-btn');
  downloadBtn.addEventListener('click', (_) => {convert(editor.getValue(), 'download')});

  document.querySelectorAll('input[name="view"]').forEach((el) => {
    el.addEventListener('change', (e) => {
      const content = editor.getValue();
      if (content) convert(content, e.target.value);
    });
  });
});

// functions
function debounce(fn, wait) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      fn.apply(context, args);
    }, wait);
  }
}

async function post(content, format) {
  try {
    const res = await fetch('/converter.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content, format }),
    });
    
    if (format === 'download') {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'converted.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      const htmlContent = await res.text();
      return htmlContent;
    }
  } catch (error) {
    console.error('Error:', error);
  };
}

async function convert(content, format) {
  if (format === 'download') {
    await post(content, format);
  } else {
    const convertedContent = await post(content, format);
    const previewContentEl = document.getElementById('content');

    if (format === 'preview') {
      previewContentEl.innerHTML = convertedContent;
    } else {
      previewContentEl.innerText = convertedContent;
    }
  }
}

function getCurrentView() {
  return document.querySelector('input[name="view"]:checked').value;
}

function setDlBtnDisabled(disabled) {
  const button = document.getElementById('download-btn');
  button.disabled = disabled;
}
