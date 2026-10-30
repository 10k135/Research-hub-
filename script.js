const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const results = document.getElementById("results");

let searchHistory =
  JSON.parse(localStorage.getItem("researchHistory")) || [];

let savedResearch =
  JSON.parse(localStorage.getItem("savedResearch")) || [];

searchBtn.addEventListener("click", search);

searchInput.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    search();
  }
});

async function search() {
  const topic = searchInput.value.trim();

  if (topic === "") {
    results.innerHTML = `
      <h2>Research Results</h2>
      <p>Please type something to research.</p>
    `;
    return;
  }

  addToHistory(topic);

  results.innerHTML = `
    <h2>Searching...</h2>
    <p>Looking for information about <strong>${topic}</strong>...</p>
  `;

  try {
    const url =
      "https://en.wikipedia.org/w/rest.php/v1/search/page?q=" +
      encodeURIComponent(topic) +
      "&limit=5";

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Search failed");
    }

    const data = await response.json();

    if (!data.pages || data.pages.length === 0) {
      results.innerHTML = `
        <h2>No results found</h2>
        <p>Try searching for another topic.</p>
      `;
      return;
    }

    results.innerHTML = `
      <h2>Research Results</h2>

      ${data.pages.map((page, index) => `
        <article class="research-card">
        ${page.thumbnail ? `<img src="https:${page.thumbnail.url}" class="research-image">` : ""}
        

          <h3>${page.title}</h3>

          <p>
            ${page.description || "No description available."}
          </p>

          <p>
            ${page.excerpt || ""}
          </p>

          <div class="research-actions">

            <a
              href="https://en.wikipedia.org/wiki/${encodeURIComponent(
                page.title.replace(/ /g, "_")
              )}"
              target="_blank"
              rel="noopener noreferrer"
            >
              Read more
            </a>

            <button onclick="saveResearch(
              '${escapeText(page.title)}',
              '${escapeText(page.description || "No description available.")}',
              'https://en.wikipedia.org/wiki/${encodeURIComponent(
                page.title.replace(/ /g, "_")
              )}'
            )">
              ⭐ Save
            </button>

          </div>

        </article>
      `).join("")}
    `;

  } catch (error) {

    results.innerHTML = `
      <h2>Something went wrong</h2>
      <p>
        We couldn't get the research results.
        Please try again.
      </p>
    `;
  }
}

function addToHistory(topic) {

  searchHistory =
    searchHistory.filter(item => item.toLowerCase() !== topic.toLowerCase());

  searchHistory.unshift(topic);

  searchHistory = searchHistory.slice(0, 10);

  localStorage.setItem(
    "researchHistory",
    JSON.stringify(searchHistory)
  );
}

function saveResearch(title, description, link) {

  const alreadySaved =
    savedResearch.some(item => item.title === title);

  if (alreadySaved) {
    alert("This research is already saved!");
    return;
  }

  savedResearch.push({
    title: title,
    description: description,
    link: link
  });

  localStorage.setItem(
    "savedResearch",
    JSON.stringify(savedResearch)
  );

  alert("Research saved ⭐");
}

function escapeText(text) {
  return text
    .replace(/'/g, "\\'")
    .replace(/"/g, "&quot;");
}
function showHistory() {
  if (searchHistory.length === 0) {
    results.innerHTML = `
      <h2>🕘 Search History</h2>
      <p>No searches yet.</p>
    `;
    return;
  }

  results.innerHTML = `
    <h2>🕘 Search History</h2>
    ${searchHistory.map(item => `
      <div class="research-card">
        <h3>${item}</h3>
        <button onclick="searchFromHistory('${escapeText(item)}')">
          Search again
        </button>
      </div>
    `).join("")}
  `;
}

function searchFromHistory(topic) {
  searchInput.value = topic;
  search();
}

function showSaved() {
  if (savedResearch.length === 0) {
    results.innerHTML = `
      <h2>⭐ Saved Research</h2>
      <p>You haven't saved any research yet.</p>
    `;
    return;
  }

  results.innerHTML = `
    <h2>⭐ Saved Research</h2>
    ${savedResearch.map(item => `
      <article class="research-card">
        <h3>${item.title}</h3>
        <p>${item.description}</p>
        <a
          href="${item.link}"
          target="_blank"
          rel="noopener noreferrer"
        >
          Read research
        </a>
      </article>
    `).join("")}
  `;
}
// Make topic cards respond when tapped
document.querySelectorAll(".topic").forEach(card => {
  card.addEventListener("click", () => {
    card.style.transform = "scale(0.97)";

    setTimeout(() => {
      card.style.transform = "";
    }, 150);
  });
});
document.querySelectorAll(".topic").forEach(card => {
  card.addEventListener("click", function () {
    const searchBox = document.querySelector("input");

    if (searchBox) {
      searchBox.value = this.textContent.trim();
    }
  });
});
function showIdea() {
  const idea = prompt("💡 What research idea do you have?");

  if (idea && idea.trim() !== "") {
    results.innerHTML = `
      <h2>💡 Your Research Idea</h2>
      <p>${idea}</p>
      <p>Great idea! You can now search this topic to learn more.</p>
    `;
  }
}
