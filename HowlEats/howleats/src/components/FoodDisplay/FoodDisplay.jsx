import React from 'react';
import { useContext } from 'react';
import { StoreContext } from '../../context/StoreContext';
import FoodItem from '../FoodItem/FoodItem';


const FoodDisplay = ({category, searchText}) => {

  const {foodList} = useContext(StoreContext);
  const normalizedCategory = category.toLowerCase();
  const searchQuery = searchText.toLowerCase();

  const filteredFoods = foodList.filter((food) => {
    const foodCategory = (food.category || '').toLowerCase();
    const matchesCategory = category === 'All' || foodCategory === normalizedCategory;
    const matchesSearch = food.name.toLowerCase().includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container">
        <div className="row">
          {filteredFoods.length > 0 ? (
              filteredFoods.map((food, index) => (
                <FoodItem key={index} 
                  name={food.name} 
                  description={food.description}
                  id={food.id}
                  imageUrl={food.imageUrl}
                  price={food.price}/>
              )) 
          ) : (
            <div className="text-center mt-4">
              <h4>No Food Found</h4>
            </div>
          )}
        </div>
    </div>
  );
};

export default FoodDisplay;
