require('dotenv').config();
const express = require('express');
const axios = require('axios').default;
const app = express();
const port = 3000;

const baseURL = process.env.REACT_APP_BASE_API_URL;

app.all('*', (req, res) => {
  const headers = {
    ...(req.headers?.authorization && { Authorization: req.headers.authorization }),
    ...(req.headers?.['Content-Type'] && { 'Content-Type': req.headers['content-type'] }),
  };

  const config = {
    method: req.method,
    url: req.path,
    data: req.body,
    baseURL: baseURL,
    headers: headers,
  };
  console.log(config);

  axios(config)
    .then((data) => {
      return res.send(data);
    })
    .catch((error) => {
      if (error.response?.data) return res.send(error.response.data);
      res.send(error);
    });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
