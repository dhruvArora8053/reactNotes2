import { useEffect, useState } from "react";
import StarRating from "./StarRating";

const tempMovieData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
  },
  {
    imdbID: "tt0133093",
    Title: "The Matrix",
    Year: "1999",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
  },
  {
    imdbID: "tt6751668",
    Title: "Parasite",
    Year: "2019",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
  },
];

const tempWatchedData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: "tt0088763",
    Title: "Back to the Future",
    Year: "1985",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "24a2b866";

export default function App() {
  const [query, setQuery] = useState("inception");
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  // fetch(`http://www.omdbapi.com/?apikey=${KEY}&s=interstellar`)
  //   .then((res) => res.json())
  //   .then((data) => setMovies(data.Search));
  // when we check out the network tab so you see that it's basically running an infinite number of requests here so it keeps going and it never really stops so every second our app is firing off multiple fetch requests to this API which ofcourse is a really bad idea so why do you think all these fetch requests are being fired off well the reason is that setting the state here in the render logic will then immediately cause the component to rerender itself again so that's just how state works however as the components is re-rendered the function here ofcourse is executed again which then will fetch again which in turn will set the movies again as well and then this whole thing starts over and over again so as the state is that the component is re-rendered again, which then will fetch again which will set the movies again and so this really is an infinite loop of state setting and then the component re-rendering and so this is the reason why it is really not allowed to set state in render logic.

  // setWatched([]);
  // same problem, now we do get a real error, here we are now reloading all the time again the data from the API but what matters here is that we got the error of too many re-renders and that's because of above state setting, so if we're really setting the state here in the top level, even without being inside a then handler then immediately react will complain that there are too many renders, which means that we again entered that infinite loop where updating state will cause the component to render which will cost the state to be set and so on to infinity.

  // useffect to the rescue:-
  // useEffect(function () {
  //   fetch(`http://www.omdbapi.com/?apikey=${KEY}&s=interstellar`)
  //     .then((res) => res.json())
  //     .then((data) => setMovies(data.Search));
  // }, []);
  // now we have no more infinite loops here and no more infinite requests to our API, so now our effect is only running as the component mounts, so again we used the use effect hook to register an effect and that effect is the function inside of it which contains the side effect that we want to register and basically register means that we want this code here not to run as the component renders but actually after it has been painted onto the screen and so that's exactly what useeffect does so while before the code was executed while the component was rendering so while the function was being executed, now this effect will actually be executed after render and that's a lot better then as a second argument we passed this empty array here into useeffect and so this means that this effect will only be executed as the component first mounts.

  useEffect(function () {
    console.log("A: after initial render");
  }, []);

  useEffect(function () {
    console.log("B: after every render");
  });

  useEffect(
    function () {
      console.log("D");
    },
    [query]
  );

  console.log("C: during render");
  // so why did we get C first, even though it appears later here in code, well the reason is that as we just discuessed before effects actually only run after the browser paint while the render logic itself runs well as the name says during render and so then it makes sense that ofcourse this console.log() here is executed first so during the render of this component and then we have A and B which comes form above two effects and so A is rendered first simply because it appears first in the code

  // and when we type on search bar something, so we update the state here which is the query state and as a result the component was re-rendered and then just like before C was executed and so therefore we see the letter C first and then after that we also have a B log so B has no dependency array which remember basically means that this effect is synchronized with everything and so therefore it needs to run on every render while the other effect A is synchronized with no variables at all which is the meaning of this empty array and therefore this effect was not executed as the component was re-rendered with the query state

  // now the D will be executed every time the query state will change, so now D useeffect is synchronized with the query state

  function handleSelectMovie(id) {
    setSelectedId((selectedId) => (selectedId === id ? null : id));
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);
  }

  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  // const tempQuery = "interstellar";
  useEffect(
    function () {
      const controller = new AbortController();
      // this is actually a broser API so this has nothing to do with react but with the browser itself, it helps in solving the race condition

      async function fetchMovies() {
        try {
          setIsLoading(true);
          setError("");

          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controller.signal }
          );

          if (!res.ok)
            throw new Error("something went wrong with fetching movies");

          const data = await res.json();

          if (data.Response === "False") throw new Error("Movie not found");

          setMovies(data.Search);
          setError("");
          // console.log(data);

          // console.log(movies);
          // now why are we getting empty array: after the state has been set in the setMovies that doesn't means data fetchs immediately so this will happen after this function here is called and so right now in console.log we have a stale state which basically means that we still have the old value as the state was before and in this case before it was just an empty array so our initial state
        } catch (err) {
          // console.err(err.message);
          // now the problem with this is that as soon as a request get canceled, javascript actually sees that as an error and so that's why we get the error into movie list, so basically above fetch request as it is canceled it will throw an error which will then immediately go here into our catch block where the error is set and so that's why we can see this error into the application 'The user aborted a request' however, this is not really an error here in our application and so we want to ignore that so what we can do in order to do that:
          if (err.name !== "AbortError") {
            setError(err.message);
          }
        } finally {
          setIsLoading(false);
        }
      }

      if (query.length < 3) {
        setMovies([]);
        setError("");
        return;
      }

      handleCloseMovie();
      fetchMovies();

      return function () {
        controller.abort();
      };
      // Race condition:
      // by using this you see that all these other ones which are not the last one got cancelled and so we can now see that now we no longer have all these different requests happening at the same time, and then finally the last one that we were actually interested in was ofcourse not canceled, but here we can clearly se that there is basically only one request happening at the time until it then got canceled by the next one.
      // so let's see why this is actually working so each time that there is a new keystroke, the component gets rerendered and as we alreay know between each of these rerenders the cleanup funciton here will get called and so what that means is that each time that there is a new keystroke, so a new rerender our controller will abort the current fetch request and so that is exactly what we want, we want to cancel the current request each time that the new one comes in and so that is exactly the point in time in which our cleanup function gets called
    },
    [query]
  );

  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {/* {isLoading ? <Loader /> : <MovieList movies={movies} />} */}
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList movies={movies} onSelectMovie={handleSelectMovie} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>

        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatched}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList
                watched={watched}
                onDeleteWatched={handleDeleteWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function Loader() {
  return <p className="loader">Loading...</p>;
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>⛔</span> {message}
    </p>
  );
}

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

// function WatchedBox() {
//
//   const [isOpen2, setIsOpen2] = useState(true);

//   return (
//     <div className="box">
//       <button
//         className="btn-toggle"
//         onClick={() => setIsOpen2((open) => !open)}
//       >
//         {isOpen2 ? "–" : "+"}
//       </button>
//       {isOpen2 && (
//         <>
//           <WatchedSummary watched={watched} />
//           <WatchedMoviesList watched={watched} />
//         </>
//       )}
//     </div>
//   );
// }

function MovieList({ movies, onSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} onSelectMovie={onSelectMovie} key={movie.imdbID} />
      ))}
    </ul>
  );
}

function Movie({ movie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function MovieDetails({ selectedId, onCloseMovie, onAddWatched, watched }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genere: genere,
  } = movie;

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
    };

    onAddWatched(newWatchedMovie);
    onCloseMovie();
  }

  // Esc keypress event:
  // so we are directly touching the DOM here which is the outside environment so for that we would need an effect:
  useEffect(
    function () {
      function callback(e) {
        if (e.code === "Escape") {
          onCloseMovie();
          console.log("Closing");
        }
      }

      document.addEventListener("keydown", callback);
      // so we are really doing basically now some dom manipulation and so we are stepping outside of react here, which is the reason why the react team also calls the useEffect hook here an escape hatch

      // but now if we close another movie, then all of a sudden we get 10 logs and so it seems like these listeners are bascially accumulating so the reason for that is that actually each time that a new movie details component mounts, a new event listener is added to the document so basically always an additional one to the ones that we already have so again each time that this effect here is executed it will basically add one more event listener to the document and so if we open up 10 movies and then close them all, we will end up with 10 of the same event listeners attached to the document which ofcourse is not what we want and so what this means is that here we also need to clean up our event listeners or in other words we need to return a function here:

      return function () {
        document.removeEventListener("keydown", callback);
      };
      // so now as soon as the movie details component unmounts, the event listener will then again be removed from the document and so then we will avoid having so many event listeners in our DOM which might become a memory problem in a larger application with like hundereds or thousands of event listeners.
    },
    [onCloseMovie]
  );

  useEffect(
    function () {
      async function getMovieDetails() {
        setIsLoading(true);
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
        );
        const data = await res.json();
        setMovie(data);
        setIsLoading(false);
      }
      getMovieDetails();
    },
    [selectedId]
  );
  // if we click on another movie then we get the same problem here our component is not updating, well we told our effect here to load the movie data whenever the componet first mounts however when we click here one of these other movies, this componet is actually not mount again so the inital render will not happen again because the component is already mounted and the reason for that is the one that we learned in the previous section, it is because this component here so the movie detail component is rendered in exactly the same place in the component tree and so as we clik here on another movie simply another prop will be passed into the component but the component itself will not be destroyed, it will stay in the component tree and so the only thing that is changing as we click on of the other movies is the ID prop that is being passed in so therefore right now this effect here will not run again because again it is only running when the component mounts which really only happens once and ofcourse if we close this component and then go to another one then the component has been unmounted first and then it is mounting again and so therefore then it is going to work so how do we solve this?
  // if we pass the selectedId in the dependency array, now as the selectedId prop changes then the effect will indeed be executed again because remember this dependency array is a little bit like an event listener that is litening for one of the dependencies to change

  // Changing the page title in the browser so outside of the application is a side effect because we are very clearly going to interact with the outside world so basically with the world outside of our react application and so this is then considered a side effect so what this means is that we will want to register a side effect using again the useeffect hook:
  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;

      // cleanup function
      return function () {
        document.title = "usePopcorn";
        console.log(`Clean up effect for movie ${title}`);
      };
    },
    [title]
  );
  // as we learned in the previous lecture this cleanup function here will actually run after the component has already unmounted and so if that's the case then how will the function actually remember this title here: closures
  // the cleanup function also runs between renders so basically after each rerender so if we click on some movie and then we click on another one then you see the cleanup function actually run again for this movie and so that happened right after the rerender
  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
            <img src={poster} alt={`poster of ${movie}`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genere}</p>
              <p>
                <span>⭐</span>
                {imdbRating} IMDb rating
              </p>
            </div>
          </header>

          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />

                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      + Add to list
                    </button>
                  )}
                </>
              ) : (
                <p>
                  You rated this movie {watchedUserRating} <span>⭐</span>
                </p>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMoviesList({ watched, onDeleteWatched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          onDeleteWatched={onDeleteWatched}
        />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, onDeleteWatched }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.Title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>

        <button
          className="btn-delete"
          onClick={() => onDeleteWatched(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}
