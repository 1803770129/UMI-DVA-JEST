import React from 'react';

import './index.less';
export default function index() {
  let userName = localStorage.getItem('account');
  return (
    <div className="container f20">
      <img src='./img/nopic.png'/>
      欢迎{userName}
    </div>
  );
}
