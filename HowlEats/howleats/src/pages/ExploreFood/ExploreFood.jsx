import React from 'react';
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay';
import './ExploreFood.css';
import { useState } from 'react';

const ExploreFood = () => {
  const [category, setCategory] = useState('All');

  const [searchText, setSearchText] = useState('');


  return (
    <div className="container">
      <div className="row justify-content-center mt-4">
        <div className="col-12 col-md-8 col-lg-7">
          <div className="search-container position-relative">
            <form className="search-form d-flex align-items-center gap-3 flex-wrap" onSubmit={(e) => e.preventDefault()}>
              <select className="form-select category-select" onChange={(e) => setCategory(e.target.value)}>
                <option value="All">All</option>
                <option value="acai">Acai</option>
                <option value="bubbleTea">Bubble Tea</option>
                <option value="burger">Burger</option>
                <option value="burrito">Burrito</option>
                <option value="cake">Cake</option>
                <option value="coffee">Coffee</option>
                <option value="dal">Dal</option>
                <option value="desserts">Desserts</option>
                <option value="drinks">Drinks</option>
                <option value="fries">Fries</option>
                <option value="indian">Indian</option>
                <option value="japanese">Japanese</option>
                <option value="mexican">Mexican</option>
                <option value="paneer">Paneer</option>
                <option value="pasta">Pasta</option>
                <option value="sandwich">Sandwich</option>
                <option value="soup">Soup</option>
                <option value="sundae">Sundae</option>
                <option value="thali">Thali</option>
              </select>
              <div className="search-input-wrapper position-relative flex-grow-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-icon">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input className="form-control search-input ps-5" type="search" placeholder="Search your favourite cuisine" aria-label="Search"
                onChange={(e) => setSearchText(e.target.value)} value={searchText} />
              </div>
              <button className="btn btn-search" type="submit">
                Search
              </button>
            </form>
          </div>
        </div>
      </div>
      <FoodDisplay category={category} searchText={searchText}/>
    </div>
  );
};

export default ExploreFood;
