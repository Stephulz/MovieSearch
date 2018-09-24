import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Movie } from './Movie'
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private selectedMovie$: Subject<Movie> = new Subject<Movie>()
  private apiKey: string = "363f912614def3458cf2386ce540e19a"
  private basiApiUrl: string = "https://api.themoviedb.org/3/search/movie"
  private baseConfigurationUrl: string = "https://api.themoviedb.org/3/configuration?api_key=" + this.apiKey;
  private imageBaseUrl: string = "";
  private imageSizes: { backdrop?: string[], poster?: string[] } = {};

  constructor(private http: HttpClient) {
    this.setImageConfiguration();
  }

  get currentMovie() {
    return this.selectedMovie$
  }

  searchMovie(query: string) {
    const params = new HttpParams().set('api_key', this.apiKey).set('query', query);
    return this.http.get<any>(this.basiApiUrl, { params }).pipe(
      map(res =>
        res.results.map((result: Movie) => {
          return {
            ...result,
            backdropUrl: this.createPhotoUrl(result.backdrop_path, true),
            posterUrl: this.createPhotoUrl(result.poster_path, false)
          }
        })
      )
    );
  }

  changeSelectedMovie(movie: Movie) {
    this.selectedMovie$.next(movie)
  }

  setImageConfiguration() {
    this.http.get<any>(this.baseConfigurationUrl).pipe(map(res => res)).subscribe((config) => {
      this.imageBaseUrl = config.images.base_url,
        this.imageSizes = {
          backdrop: config.images.backdrop_sizes,
          poster: config.images.poster_sizes
        }
      console.log(this.imageBaseUrl);
      console.log(this.imageSizes);
    })
  }

  createPhotoUrl(path: string, isBackdrop: boolean) {
    if (!path) {
      return "";
    }
    const { backdrop, poster } = this.imageSizes
    const imageSize = isBackdrop ? this.imageSizes.backdrop[0] : poster[poster.length - 1]
    return `${this.imageBaseUrl}${imageSize}${path}`
  }

}
