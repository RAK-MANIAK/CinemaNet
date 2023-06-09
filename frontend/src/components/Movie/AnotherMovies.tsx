import { Link, useParams } from 'react-router-dom';
import { IMovie } from '../../Interfaces';
import { useState, useEffect } from 'react';
import { useHttpClient } from '../../hooks/http-hook';

const AnotherMovies = () => {
  const { sendRequest } = useHttpClient();
  const [anotherMovies, setAnotherMovies] = useState<IMovie[]>([]);
  const { movieSlug } = useParams();

  useEffect(() => {
    (async () => {
      const date = new Date();
      const response = await sendRequest({
        url: `/api/v1/movies`,
        params: {
          limit: 9,
          'rentalPeriod.end[gte]': date,
        },
        showErrMsg: true,
      });
      if (!response) return;

      let filteredMovies = response.data.data.data.filter(
        (movie: IMovie) => movie.slug !== movieSlug
      );

      if (filteredMovies.length > 8) {
        filteredMovies = filteredMovies.slice(0, 8);
      }
      setAnotherMovies(filteredMovies);
    })();
  }, [movieSlug]);

  return (
    <div className='grid grid-cols-4 gap-4'>
      {anotherMovies.map(movie => (
        <Link
          to={`/movie/${movie.slug}`}
          key={movie._id}
          className='w-[150px] transition duration-300 hover:text-red-500'
        >
          <div
            className='relative mb-[10px] h-[220px] w-full rounded bg-cover bg-center bg-no-repeat'
            style={{ backgroundImage: `url(${movie.imageCover})` }}
          />
          {movie.name}
        </Link>
      ))}
    </div>
  );
};

export default AnotherMovies;
