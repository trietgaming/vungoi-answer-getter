const injectedCss = document.createElement("style");
injectedCss.textContent = `
  .vungoianswergetter {
    background-color: #ffffff!important;
    outline: 1px solid #3498db;
    border-radius: 8px;
  }
  .disable-events {
    pointer-events: auto!important;
    user-select: auto!important;
  }

  .enable-events {
    pointer-events: auto!important;
    user-select: auto!important;
  }

  .content-quiz {
    pointer-events: auto!important;
    user-select: auto!important;
  }

  .rich_text {
    user-select: auto!important;
  }
`;
document.documentElement.appendChild(injectedCss);

// Enable contextmenu
const listen = document.addEventListener;
document.addEventListener = function (e, ...args) {
  if (e === "contextmenu" || e === "keyup" || e === "keydown") {
    return;
  }
  return listen.bind(document)(e, ...args);
};

function nodeWithClass(tag, classname, innerhtml) {
  const el = document.createElement(tag);
  el.className = classname;
  el.innerHTML = innerhtml;
  return el;
}

let callback;

const observer = new MutationObserver(function (mutations) {
  // console.log("Calling cb:", callback);
  if (callback) callback();
  observer.disconnect();
});

function watch(elem, cb) {
  callback = cb;
  // console.log("observing", elem);
  observer.observe(elem, { childList: true, subtree: true });
}

const header =
  "<p><b>(vungoi-answer-getter) Lời giải của GV Vungoi.vn:</b></p>";
const sugHeader = "<p><b>Gợi ý:</b></p>";
console.log("INJECTED");
const { fetch: origFetch } = window;
window.fetch = async function (url, ...args) {
  const response = await origFetch(url, ...args);
  if (url.includes("getQuiz")) {
    console.log("New Question detected.");
    const data = await response.json();
    const explainationHtmls = data.quiz.solution_detail.map(
      (obj) => obj.content
    );
    const suggestionHtmls = data.quiz.solution_suggesstion.map(
      (obj) => obj.content
    );
    const solutionElements = document.getElementById("solution-undefined");
    if (solutionElements) {
      console.log("Showing solution...");
      const solutionElement = nodeWithClass(
        "div",
        "solution-item vungoianswergetter",
        header + explainationHtmls
      );
      const suggestionElement = nodeWithClass(
        "div",
        "solution-item vungoianswergetter",
        sugHeader + suggestionHtmls
      );
      solutionElements.textContent = "";
      solutionElements.appendChild(suggestionElement);
      solutionElements.appendChild(solutionElement);
    }
  }
  return response;
};
