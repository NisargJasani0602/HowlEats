import React from 'react';
import {assets} from '../../../assets/assets';
import { addFood } from '../../../services/foodService';
import { toast } from 'react-toastify';


const AddFood = () => {
  const [image, setImage] = React.useState(false);
  const [data, setData] = React.useState({
    name: '',
    description: '',
    category: '',
    price: ''
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(data => ({...data, [name]: value})); 
  }

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    if(!image) {
      toast.error("Image is required");
      return;
    }

    try {
      await addFood(data, image);
      toast.success("Food Added Successfully");
      setData({
        name: '',
        description: '',
        category: '',
        price: ''
      });
      setImage(null);
       
    }
    catch (error) {
      toast.error("Error while adding food");
      console.error("There was an error!", error);
    }
  }

  return (
    <div className="mx-2 mt-2">
  <div className="row">
    <div className="card col-md-3">
      <div className="card-body">
        <h2 className="mb-4">Add Food</h2>
        <form onSubmit = {onSubmitHandler}>
          <div className="mb-3">
            <label htmlFor="image" className="form-label">
              <img src={image ? URL.createObjectURL(image) : assets.upload} alt="" width={98} />
            </label>
            <input type="file" className="form-control" id="image" hidden onChange = {(e) => setImage(e.target.files[0])}/>
          </div>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Name</label>
            <input type="text" placeholder='Food Name' className="form-control" id="name" required name='name' onChange={onChangeHandler} value={data.name}/>
          </div>
          <div className="mb-3">
            <label htmlFor="description" className="form-label">Description</label>
            <textarea className="form-control" placeholder='Write Content For Food Description' id=" description" rows="5" required name='description' onChange={onChangeHandler} value={data.description}></textarea>
          </div>
          <div className="mb-3">
            <label htmlFor="category" className="form-label">Category</label>
            <select name="category" id="category" className="form-control" onChange={onChangeHandler} value={data.category}> 
              <option value="" disabled>Select Category</option>
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
          </div>
          <div className="mb-3">
            <label htmlFor="price" className="form-label">Price</label>
            <input type="number" name="price" placeholder='$20' id="price" className='form-control' onChange={onChangeHandler} value={data.price}/>
          </div>
          <button type="submit" className="btn btn-primary">Save</button>
        </form>
      </div>
    </div>
  </div>
</div>
  )
}

export default AddFood;
