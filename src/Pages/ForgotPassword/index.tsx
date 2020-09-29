import React, { useState } from 'react';
import api from '../../services/api';
import { Form, Button } from 'react-bootstrap';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    api
      .post('/password/forgot', email)
      .then(res => {
        console.log(res.data);

        window.location.href = '/';
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  return (
    <>
      <h3>Recuperar senha</h3>
      <Form onSubmit={onSubmit}>
        <Form.Group>
          <Form.Label>Email: </Form.Label>
          <Form.Control
            type="text"
            placeholder="email"
            required
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
          />
        </Form.Group>

        <Form.Group>
          <Button type="submit" variant="primary">
            Recuperar
          </Button>
        </Form.Group>
      </Form>
    </>
  );
};

export default ForgotPassword;
