/* Regular Expressions for Pre/Post Estimates in strings:
    Pre-estimates: "(123)"
    Post-estimates: "[123]"
*/
const regexpForPostPoints = new RegExp("\\[[0-9]+\\]");
const regexpForPrePoints = new RegExp("\\([0-9]+\\)");

// Selects all divs for the card's text in in a board.
const getCards = () =>
  Array.from(
    document.querySelectorAll(
      ".notion-board-group > div.notion-collection-item > a > div.notion-focusable div[data-content-editable-leaf=true]"
    )
  );

// Replaces the points from text to styled spans.
const replacePointsInCards = (
  nodes,
  regexp,
  openChar,
  closeChar,
  className
) => {
  nodes.forEach((el) => {
    const matches = el.innerHTML.match(regexp);

    if (matches) {
      // Get the numeric value of the points by stripping the open and close chars.
      const points = matches[0].replace(openChar, "").replace(closeChar, "");

      const styledPoints = `<span class="${className}">${points}</span>`;

      // Append the styledPoints span while removing the plain text points.
      el.innerHTML = styledPoints + el.innerHTML.replace(regexp, "");
    }
  });
};

const addPointsToCards = () => {
  const nodes = getCards();

  replacePointsInCards(
    nodes,
    regexpForPostPoints,
    "[",
    "]",
    "post_estimate_points"
  );

  replacePointsInCards(
    nodes,
    regexpForPrePoints,
    "(",
    ")",
    "pre_estimate_points"
  );
};

// Function to check if element exists in the DOM.
const checkElement = async (selector) => {
  while (document.querySelector(selector) === null) {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
  return document.querySelector(selector);
};

/*******************************
 *    MAIN APP ENTRY POINT     *
 *******************************/

// ON INITIAL PAGE RENDER
// Check if the element exists, and if so then invoke function to add points.
checkElement(".notion-board-group > div.notion-collection-item").then(() => {
  addPointsToCards();

  const targetNode = document.querySelector(".notion-board-view");

  // Select the node that will be observed for mutations
  new MutationObserver(() => {
    addPointsToCards();
  }).observe(targetNode, { subtree: true, childList: true });

  // Debouncing in case of re-renders (React virtual dom can be iffy here...)
  setTimeout(function () {
    addPointsToCards();
  }, 500);
});

// ON URL CHANGE (when loading different notion pages, changing views, opening details)
// Store initial URL in variable.
let currentPage = location.href;

// Listen for changes.
setInterval(function () {
  if (currentPage != location.href) {
    // Page has changed, store new page.
    currentPage = location.href;

    // Rerun the main function call on rerun.
    checkElement(".notion-board-group > div.notion-collection-item") //use whichever selector you want
      .then((element) => {
        addPointsToCards();

        // Debouncing in case of re-renders (React virtual dom can be iffy here...)
        setTimeout(function () {
          addPointsToCards();
        }, 500);
      });
  }
}, 500);
