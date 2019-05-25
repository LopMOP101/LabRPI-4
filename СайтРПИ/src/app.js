'use strict';

const accessKey = '6462ea9932c247d4af1406961bf5c0e2';

const articlesEl = document.querySelector('.articles');
const loadMoreEl = document.getElementById('loadMore');
const searchBySourceEl = document.getElementById('searchBySource');
const liveSearchBySourceEl = document.querySelector('.liveSearchBySource');
const searchByWordEl = document.getElementById('searchByWord');
const searchByWordFormEl = document.getElementById('searchByWordForm');

const articleTemplate = document.getElementById('articleTemplate').innerHTML;

const requiredCount = 5;
const maxArticles = 40;

let articlesAmount = 0;
let page = 1;
let isAllNews = false;
let sources = [];
let currentSourceId = '';
let currentSearchWord = '';

function reset(){
  articlesAmount = 0;
  page = 1;
  isAllNews = false;
  articlesEl.innerHTML = '';
  currentSourceId = '';
  currentSearchWord = '';
  // liveSearchBySourceEl.style.display = 'none';
}

function openUrl(url) {
  window.open(url, '_blank');
}

function getData(url, successCallback) {
  url = url.indexOf('?') == -1 ? url + '?apiKey=' + accessKey : url + '&apiKey=' + accessKey;
  fetch(url)
  .then((response) => response.json())
  .then(successCallback)
  .catch(console.error);
}

function compileTempalte(template, data) {
  for (let key in data) {
    template = template.replace('{' + key + '}', data[key]);
  }
  return template;
}

function loadArcticles(page, count) {
  let paramSource = '', 
      paramCountry = '',
      paramQ = '';
  if (currentSourceId != '') {
    paramSource = '&sources=' + currentSourceId;
    if (currentSearchWord != ''){
      paramQ = '&q=' + currentSearchWord;
    }
  } else if (currentSearchWord != ''){
    paramQ = '&q=' + currentSearchWord;
  } else {
    paramCountry = '&country=ru';
  }
  getData('https://newsapi.org/v2/top-headlines?pageSize=' + count + '&page=' + page + paramSource + paramCountry + paramQ, function(data) {
    if (data.articles.length == 0) {
      articlesEl.innerHTML = '<p>Нет статей, соответствующих вашему запросу</p>';
      return;
    }
    for (let article of data.articles) {
      if (article.author == null) {
        article.author = 'Anonimous';
      }
      if (article.description == null) {
        article.description = '';
      }
      article.publishedAt = article.publishedAt.substring(0, 10);
      articlesEl.innerHTML += compileTempalte(articleTemplate, article);
    }
    articlesAmount += data.articles.length
    if (articlesAmount == data.totalResults) {
      isAllNews = true;
    }
  });
}

function loadArticlesBySource(sourceId) {
  reset();
  currentSourceId = sourceId;
  loadArcticles(page++, requiredCount);
}

function loadSources() {
  getData('https://newsapi.org/v2/sources?country=ru', function(data) {
    let ruSources = data.sources;
    getData('https://newsapi.org/v2/sources', function(data) {
      sources = data.sources
      console.log(sources)
      searchBySourceEl.innerHTML = ''
      for (let i = 0; i < 4; i++) {
        if (ruSources[i]){
          searchBySourceEl.innerHTML += '<div onclick="loadArticlesBySource(`' + ruSources[i].id + '`)">' + ruSources[i].name + '</div>';
        }
      }
      let j = 0;
      for (let i = 0; i < sources.length; i++) {
        if (sources[i] && (
          sources[i].id == "bbc-sport" ||
          sources[i].id == "techcrunch" ||
          sources[i].id == "talksport" ||
          sources[i].id == "the-next-web" || 
          sources[i].id == "football-italia" || 
          "fox-sports" == sources[i].id
        )){
          searchBySourceEl.innerHTML += '<div onclick="loadArticlesBySource(`' + sources[i].id + '`)">' + sources[i].name + '</div>';
          j++;
          if (j == 6) break;
        }
      }
    })
  })
}

searchByWordFormEl.onsubmit = function(e) {
  reset();
  currentSearchWord = searchByWordEl.value;
  loadArcticles(page++, requiredCount);
  e.preventDefault();
  return false;
}

loadMoreEl.onclick = function() {
  if (!isAllNews && articlesAmount != maxArticles) {
    loadArcticles(page++, requiredCount);
  }
}

loadArcticles(page++, requiredCount);
loadSources()