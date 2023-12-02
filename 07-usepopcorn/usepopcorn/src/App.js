import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import userEvent from "@testing-library/user-event";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "24a2b866";

export default function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  // const [watched, setWatched] = useState([]);
  const [watched, setWatched] = useState(function () {
    const storedValue = localStorage.getItem("watched");
    return JSON.parse(storedValue);
    // react will call this function on the intial render and it will use whatever value is returned from this function as the initial value of the state and this function here actually needs to be a pure function and it cannot receive any arguments, so passing arguments in this function is  not going to work and also just like values that we pass in, react will only consider this function here on the initial render so this function is only executed once on the initial render and is simply ignored on subsequent rerenders
  });

  function handleSelectMovie(id) {
    setSelectedId((selectedId) => (selectedId === id ? null : id));
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);

    // local storage is just a very simple key value pair storage that is available in the browser and where we can store some data for each domain so basically the data that we store in local storage now will only be available to exactly this application url
    // localStorage.setItem("watched", JSON.stringify([...watched, movie]));
    // we need to convert all of the data into string because in local storage we can only store key value pairs where the value is a string
  }

  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  useEffect(
    function () {
      localStorage.setItem("watched", JSON.stringify(watched));
    },
    [watched]
  );
  // this is a great advantage of having used the useEffect hook instead of setting local state right here in the event handler because if we had done it like in the state, then we would also have to manually set the local storage there as we deleted a movie, but now here since we have basically synchronized the two of them, we no longer need to do that

  useEffect(
    function () {
      const controller = new AbortController();

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
        } catch (err) {
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
  // useEffect(function () {
  //   const el = document.querySelector(".search");
  //   console.log(el);
  //   el.focus();
  // }, []);
  // however, as we learned at the very beginning, React is all about being declarative and so manually selecting a DOM element like this is not really the react way of doing things, so it's not in line with the rest of our react code so in react we really don't want to manually add event listeners like above and also having to add classes or ids just for the purpose of selecting is not really nice and again not really the react way of doing things and also if for some reason we would need some dependency here for ex: if this code should rerun each time the query changes, then that would mean that we would select the element here over and over again, which is also not ideal and to solve all these problems and to make the action of selecting an element more declarative such as everything else in react, we need the concept of refs:

  const inputEl = useRef(null);

  useEffect(function () {
    function callback(e) {
      console.log(inputEl.current);
      if (e.code === "Enter") {
        inputEl.current.focus();
        setQuery("");
      }
    }
    document.addEventListener("keydown", callback);
    return () => document.addEventListener("keydown", callback);
  }, []);
  // now we successfully connected the ref that we created here with the below DOM element so simply by passing this ref into the ref prop and so then in a useEffect after the dom has been loaded, we can use this dom element inside the ref.current property

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
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

  // 1.
  // /* eslint-disable*/
  // if (imdbRating > 8) [isTop, setIsTop] = useState(true);
  // as soon as the data arrived the imdb rating was indeed greater than eight and so then react called usestate here and so then on the next render the fourth hook was no longer the useeffect but this state right above so now we can clearly see that our linked list of hooks is different and so react is not happy about that at all

  // if (imdbRating > 8) return <p>Greatest ever!</p>;
  // this time it gives the error, fewer hooks were actually rendered and so that's becuase right now we only have above three states but then the 3 effects that we had they are now no longer created, so instead of 6 hooks now we only have 3 hooks and so therefore this again creates a big problem because like this, we cannot guarantee that all the hooks are always called in the same order so be very careful of that

  // const [isTop, setIsTop] = useState(imdbRating > 8);
  // console.log(isTop);
  // now this log is showing false, event though when we click on interstellar the rating here is greater than 8, so why is that, well it is because of the reason which is the fact that whatever we pass into usestate is the initial state and react will only look at this initial state on the initial render so when the component first mounts however when the component first mounts here the imdb rating will still be undefined so this here is then false and so it will stay false forever becuase nowhere we update the state and on the second render so when we then finally get the movie data, this will not be executed again and so therefore it will stay false forever, now one way of fixing this would be to use a useeffect,
  // useEffect(
  //   function () {
  //     setIsTop(imdbRating > 8);
  //   },
  //   [imdbRating]
  // );
  const isTop = imdbRating > 8;
  console.log(isTop);

  // const [avgRating, setAvgRating] = useState(0);

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
    // onCloseMovie();

    // setAvgRating(Number(imdbRating));
    // alert(avgRating);
    // well we still got the alert message with 0, and so that's again becuase the state is set asynchronously here or in other words we do not get access to the updated state right after doing that so right after we call the state updating function so only once react is done processing this event handler, it will then update all the state and rerender the UI

    // setAvgRating((avgRating + userRating) / 2);
    // no we get the avg = 5 which is (0 + 10)/2, but why is the avgRating still at 0 here even though we have updated it before, it is again because it is a asynchronous state setting which means that at this point here, the average rating has not been set yet so it's till at 0 which is the initial value right here and so because of that we say that the average rating state is stale at this point so we have stale state right here but luckily for us we already know how to solve this which is by passing a callback function and so that callback will get access to the current value:
    // setAvgRating((avgRating) => (avgRating + userRating) / 2);
    // so now we get the correct avg, so this time what happened was that the average was again set to the imdb rating, so the 8.6 but then in the next line here we already got access to that new value
  }

  useEffect(
    function () {
      function callback(e) {
        if (e.code === "Escape") {
          onCloseMovie();
        }
      }

      document.addEventListener("keydown", callback);

      return function () {
        document.removeEventListener("keydown", callback);
      };
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

  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;

      // cleanup function
      return function () {
        document.title = "usePopcorn";
      };
    },
    [title]
  );

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

          {/* <p>{avgRating}</p> */}

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
