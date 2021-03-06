import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { AxiosResponse } from 'axios';
import { useParams } from 'react-router-dom';
import api from '../../services/api';

import { ShowContainer, ShowJumbotron, ShowRow, ShowCol } from './styles';
import Footer from '../../Components/Footer';

interface Article {
  title: string;
  description: string;
  markdownArticle: string;
  tags: string;
  author: string;
  date: Date;
}

const ViewArticle: React.FC = () => {
  let params: any = useParams();
  const [article, setArticle] = useState<Article>({
    title: '',
    description: '',
    markdownArticle: '',
    tags: '',
    author: '',
    date: new Date(),
  });

  useEffect(() => {
    api
      .get('/articles/' + params.id)
      .then((response: AxiosResponse) => {
        setArticle({
          title: response.data.article.title,
          description: response.data.article.description,
          markdownArticle: response.data.article.markdownArticle,
          tags: response.data.article.tags[0],
          author: response.data.article.author,
          date: new Date(response.data.article.date.toString()),
        });
      })
      .catch(function (error) {
        console.log(error);
      });
  });

  return (
    <>
      <ShowJumbotron fluid>
        <h1>{article.title}</h1>
      </ShowJumbotron>
      <ShowContainer>
        <ShowRow>
          <ShowCol>
            <ReactMarkdown source={article.markdownArticle} />
          </ShowCol>
        </ShowRow>
      </ShowContainer>
      <Footer />
    </>
  );
};

export default ViewArticle;
