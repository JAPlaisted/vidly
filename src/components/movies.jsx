import React, { Component } from 'react'
import { getGenres } from '../services/fakeGenreService';
import { getMovies } from "../services/fakeMovieService";
import { paginate } from '../utils/paginate';
import { Link } from 'react-router-dom';
import ListGroup from './common/listGroup';
import Pagination from './common/pagination';
import MoviesTable from './moviesTable';
import SearchBox from './searchBox';
import _ from 'lodash'

class Movies extends Component {
    state = { 
        movies: [],
        genres: [],
        currentPage: 1,
        pageSize: 4,
        searchQuery: "",
        selectedGenre: null,
        sortColumn: {path: 'title', order: 'asc' }
     }

     componentDidMount() {
        const genres = [{ _id: "", name: 'All Genres'}, ...getGenres()]
        this.setState({movies: getMovies(), genres });
     }

     handleDelete = (movie) => {
        const movies = this.state.movies.filter(m => m._id !== movie._id);
        this.setState({ movies})
    }

    handleLike = (movie) => {
        const movies = [...this.state.movies];
        const index = movies.indexOf(movie);
        movies[index] = {...movies[index]}
        movies[index].liked = !movies[index].liked;
        this.setState({ movies });
    }

    handlePageChange = page => {
        this.setState({ currentPage: page})
    }

    handleGenreSelect = genre => {
        this.setState({ selectedGenre: genre, searchQuery: "", currentPage: 1 });
    }

    handleSort = sortColumn => {
        this.setState({sortColumn})
    }

    handleSearch = query => {
        this.setState({ searchQuery: query, selectedGenre: null, currentPAge: 1 })
    }

    getPageData = () => {
        const { pageSize, currentPage, movies: allMovies, selectedGenre, searchQuery, sortColumn } = this.state
        let filtered = allMovies;
        if (searchQuery) {
            filtered = allMovies.filter(m => m.title.toLowerCase().startsWith(searchQuery.toLowerCase())); 
        }
        else if (selectedGenre && selectedGenre._id) {
            filtered = allMovies.filter(m => m.genre._id === selectedGenre._id);
        
        };

        const sorted = _.orderBy(filtered, [sortColumn.path], [sortColumn.order])

        const movies = paginate(sorted, currentPage, pageSize)

        return { totalCount: filtered.length, data: movies }
    };

    

    render() { 
        const { length: movieCount } = this.state.movies
        const { pageSize, currentPage, sortColumn, searchQuery } = this.state
        if(movieCount === 0) return <p>There are no movies available.</p>
        const { totalCount, data: movies } = this.getPageData();

        return (
            <div className='row'>
                <div className="col-3">
                    <ListGroup 
                        items={this.state.genres} 
                        selectedItem={this.state.selectedGenre}
                        onItemSelect={this.handleGenreSelect} 
                    />
                </div>
                <div className="col">
                    <Link to="/movies/new"
                          className="btn btn-primary"
                          style={ {marginBottom: 20} }
                          >New Movie</Link>
                <p>showing { totalCount } movies.</p>
                <SearchBox value={searchQuery} onChange={this.handleSearch} />
                <MoviesTable 
                    movies={movies}
                    sortColumn={sortColumn}
                    onLike={this.handleLike}
                    onDelete={this.handleDelete}
                    onSort={this.handleSort}
                />
                <Pagination 
                    itemsCount={totalCount} 
                    pageSize={pageSize} 
                    onPageChange={this.handlePageChange} 
                    currentPage={currentPage} 
                />
                </div>
            </div>

        );
    }
}
 
export default Movies;