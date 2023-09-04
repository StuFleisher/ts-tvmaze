import axios from "axios";
import jQuery from "jquery";

const $ = jQuery;

const $showsList: JQuery = $("#showsList");
const $episodesArea: JQuery = $("#episodesArea");
const $searchForm: JQuery = $("#searchForm");

const DEFAULT_IMAGE_URL: string = "https://tinyurl.com/tv-missing";
const BASE_API: string = "https://api.tvmaze.com/";

interface ShowInterface {
  id: number;
  name: string;
  summary: string;
  image: string;
}

interface ShowDataInterface {
  show: {
    id: number;
    name: string;
    summary: string;
    image?: { medium: (string | null); };
  };
}

interface EpisodeInterface {
  id: number;
  name: string;
  season: number;
  number: number;
}

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function searchShowsByTerm(term: string): Promise<ShowInterface[]> {
  // ADD: Remove placeholder & make request to TVMaze search shows API.

  const response = await axios.get(`${BASE_API}search/shows?q=${term}`);
  const data: ShowDataInterface[] = response.data;

  const shows: ShowInterface[] = data.map((show) => {
    return {
      id: show.show.id,
      name: show.show.name,
      summary: show.show.summary,
      image: show.show.image?.medium || DEFAULT_IMAGE_URL,
    };
  });

  return shows;
}

/** Given list of shows, create markup for each and to DOM */

function populateShows(shows: ShowInterface[]): void {
  $showsList.empty();

  for (let show of shows) {
    const $show: JQuery = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="${show.name}"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `
    );

    $show.find(".Show-getEpisodes").data("id", show.id);
    $showsList.append($show);
  }
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay(): Promise<void> {
  const term = $("#searchForm-term").val() as string;
  const shows: ShowInterface[] = await searchShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id: number): Promise<EpisodeInterface[]> {
  const response = await axios.get(`${BASE_API}shows/${id}/episodes`);
  console.log("episodes list: ", response.data);

  const episodes: EpisodeInterface[] = response.data.map((epi: EpisodeInterface) => {
    return {
      id: epi.id,
      name: epi.name,
      season: epi.season,
      number: epi.number,
    };
  });

  return episodes;
}

/** Creates markup for each episode and appends HTML to DOM.
 *
 * Accepts a list of episodes:
 *    [{ id, name, season, number}, ...]
 */

function populateEpisodes(episodes: EpisodeInterface[]): void {
  $episodesArea.empty();

  for (let epi of episodes) {
    const $epi = $(
      `<li>${epi.name} (Season ${epi.season}, Episode ${epi.number})</li>`
    );

    $episodesArea.append($epi);
  }
}


//Add event listeners
$searchForm.on("submit",
  async function (evt: JQuery.SubmitEvent): Promise<void> {
    evt.preventDefault();
    await searchForShowAndDisplay();
  });

$showsList.on("click", ".Show-getEpisodes",
  async function (evt: JQuery.ClickEvent): Promise<void> {
    evt.preventDefault();
    const id: number = $(evt.target).data("id");
    const episodes: EpisodeInterface[] = await getEpisodesOfShow(id);

    $episodesArea.show();
    populateEpisodes(episodes);
});