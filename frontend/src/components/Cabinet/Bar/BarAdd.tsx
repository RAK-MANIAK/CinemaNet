import { useEffect, useState } from 'react';
import { IBar } from '../../../Interfaces';
import { useForm } from '../../../hooks/form-hook';
import ImageUpload from '../../UI/Form/ImageUpload';
import Input from '../../UI/Form/Input';
import { VALIDATOR_MIN, VALIDATOR_REQUIRE } from '../../../utils/validators';
import Button from '../../UI/Button';
import Loading from '../../UI/Loading';
import { AxiosResponse } from 'axios';
import { CinemaState } from '../../../contexts/CinemaProvider';
import DangerContent from '../../UI/Details/DangerContent';
import DeleteAction from '../DeleteAction';
import { useHttpClient } from '../../../hooks/http-hook';

interface IProps {
  setBars: React.Dispatch<React.SetStateAction<IBar[]>>;
  setMode: React.Dispatch<React.SetStateAction<string>>;
  buttons: string[];
  searchParam: string;
  setSearchParam: React.Dispatch<React.SetStateAction<string>>;
}

const BarAdd = (props: IProps) => {
  const { sendRequest, isLoading } = useHttpClient();
  const { cinema } = CinemaState();
  const [bar, setBar] = useState<IBar>({} as IBar);
  const [formState, inputHandler] = useForm(
    {
      name: {
        value: null,
        isValid: false,
      },
      price: {
        value: null,
        isValid: false,
      },
      imageCover: {
        value: null,
        isValid: true,
      },
    },
    false
  );

  useEffect(() => {
    if (!props.searchParam) return;
    (async () => {
      const response = await sendRequest({
        url: `/api/v1/bars/${props.searchParam}`,
        showErrMsg: true,
      });

      props.setSearchParam('');
      if (response) setBar(response.data.data.data);

      Object.values(formState.inputs).map(el => {
        el.isValid = true;
      });
    })();
  }, [props.searchParam]);

  const createMovieSubmitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    (async () => {
      const body: { [key: string]: any } = {};
      Object.entries(formState.inputs).forEach(([key, el]) => {
        if (key === 'imageCover') return;
        body[key] = el.value;
      });

      body.cinema = cinema._id;

      let response: AxiosResponse<any, any> | undefined;
      if (bar._id) {
        response = await sendRequest({
          url: `/api/v1/bars/${bar._id}`,
          method: 'PATCH',
          data: body,
          showSuccessMsg: 'Bar updated successfully!',
          showErrMsg: true,
        });
        props.setBars(prevState =>
          prevState.map(el =>
            el._id === bar._id ? response?.data.data.data : el
          )
        );
      } else {
        response = await sendRequest({
          url: '/api/v1/bars',
          method: 'POST',
          data: body,
          showSuccessMsg: 'Bar created successfully!',
          showErrMsg: true,
        });
        props.setBars(prevState => [...prevState, response?.data.data.data]);
      }

      if (formState.inputs.imageCover.value !== null) {
        const formData = new FormData();
        formData.append('imageCover', formState.inputs.imageCover.value);
        response = await sendRequest({
          url: `/api/v1/bars/${response?.data.data.data._id}`,
          method: 'PATCH',
          data: formData,
          showErrMsg: true,
        });
      }
      props.setMode(props.buttons[0]);
    })();
  };

  const handleDelete = async () => {
    try {
      const response = await sendRequest({
        url: `/api/v1/bars/${bar._id}`,
        method: 'DELETE',
        showSuccessMsg: 'Bar deleted successfully!',
        showErrMsg: true,
      });
      if (response?.data === '') {
        props.setBars(prevState => prevState.filter(el => el._id !== bar._id));
        props.setMode(props.buttons[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <form onSubmit={createMovieSubmitHandler} className='flex flex-col gap-3'>
        <div className='flex gap-10'>
          <ImageUpload
            id='imageCover'
            preview={bar.imageCover || '/images/bar/default.png'}
            width={215}
            height={215}
            rounded='rounded'
            onInput={inputHandler}
            initialValid={true}
          />
          <div>
            <Input
              element='input'
              type='text'
              label='Name'
              id='name'
              validators={[VALIDATOR_REQUIRE()]}
              errorText='Please enter a valid name'
              autoComplete='off'
              onInput={inputHandler}
              value={bar.name}
              initialValid={bar._id ? true : false}
            />
            <Input
              element='input'
              type='number'
              label='Price'
              id='price'
              validators={[VALIDATOR_REQUIRE(), VALIDATOR_MIN(0.01)]}
              errorText='Please enter a valid price'
              autoComplete='off'
              onInput={inputHandler}
              value={`${bar.price}`}
              initialValid={bar._id ? true : false}
            />
          </div>
        </div>
        <Button disabled={!formState.isValid || isLoading}>
          {isLoading ? <Loading size={28} /> : 'Submit'}
        </Button>
      </form>
      {bar._id && (
        <DangerContent className='mt-10 px-5' classNameChild='flex gap-14'>
          <DeleteAction handleDelete={handleDelete} />
        </DangerContent>
      )}
    </>
  );
};

export default BarAdd;
