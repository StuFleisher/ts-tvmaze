import axios from "axios";
import jQuery from 'jquery';

const $ = jQuery;

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");

const DEFAULT_IMAGE_URL: string = "https://tinyurl.com/tv-missing";
const BASE_API: string = "http://api.tvmaze.com/";

interface ShowInterface {
  id: number,
  name: string,
  summary: string,
  image: string;
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
  console.log(response.data)
  const shows:ShowInterface[] = response.data.map(show=>{
    return {
      id:show.show.id,
      name: show.show.name,
      summary: show.show.summary,
      image: show.show.image?.medium || DEFAULT_IMAGE_URL,
    }
  })
  console.log(shows)
  return shows;
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="http://static.tvmaze.com/uploads/images/medium_portrait/160/401704.jpg"
              alt="Bletchly Circle San Francisco"
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
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await searchShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

// async function getEpisodesOfShow(id) { }

/** Write a clear docstring for this function... */

// function populateEpisodes(episodes) { }