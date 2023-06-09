import { useEffect, useState } from 'react';
import Modal from '../UI/Modal/Modal';
import { ICinema } from '../../Interfaces';
import { CinemaState } from '../../contexts/CinemaProvider';
import Cookies from 'universal-cookie';
import CitiesModal from './CitiesModal';
import CinemasModal from './CinemasModal';
import { useHttpClient } from '../../hooks/http-hook';

interface IProps {
  children: React.ReactNode;
  className?: string;
}

const ChooseCinema = ({ children, className }: IProps) => {
  const { sendRequest } = useHttpClient();
  const [showCinemas, setShowCinemas] = useState<boolean>(false);
  const [cinemas, setCinemas] = useState<ICinema[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [cityCinemas, setCityCinemas] = useState<ICinema[]>([]);
  const { cinema, setCinema } = CinemaState();
  const [city, setCity] = useState<string>('');

  useEffect(() => {
    setCity(cinema.location.city);
  }, [cinema]);

  useEffect(() => {
    (async () => {
      const response = await sendRequest({
        url: '/api/v1/cinemas',
        params: { sort: ['location.city', 'name'] },
        showErrMsg: true,
      });
      if (response) setCinemas(response.data.data.data);
    })();
  }, []);

  useEffect(() => {
    const cityCinemas = cinemas.filter(cinema => cinema.location.city === city);
    setCityCinemas(cityCinemas);
  }, [city, cinemas]);

  useEffect(() => {
    const cities = cinemas.map(cinema => cinema.location.city);
    const uniqueCities = [...new Set(cities)];
    setCities(uniqueCities);
  }, [cinemas]);

  const handleCityClick = (city: string) => {
    setCity(city);
  };

  const handleCinemaClick = (cinema: ICinema) => {
    setCinema(cinema);
    const cookies = new Cookies();
    cookies.set('CinemaNet: cinema._id', cinema._id, {
      path: '/',
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    });
    setShowCinemas(false);
  };

  return (
    <>
      <Modal
        show={showCinemas}
        onCancel={() => setShowCinemas(false)}
        position='right'
        closeColor='black'
      >
        <div className='flex h-screen justify-between text-3xl child:p-10'>
          <CitiesModal city={city} cities={cities} onClick={handleCityClick} />

          <CinemasModal
            cityCinemas={cityCinemas}
            handleCinemaClick={handleCinemaClick}
          />
        </div>
      </Modal>

      <button onClick={() => setShowCinemas(true)} className={className}>
        {children}
      </button>
    </>
  );
};

export default ChooseCinema;
