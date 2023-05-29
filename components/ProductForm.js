import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Spinner from "./Spinner";
import { ReactSortable } from "react-sortablejs";

export default function ProductForm({
    _id,
    title:existingTitle,
    description:existingDescription,
    price:existingPrice,
    images:existingImages,
    category:assingnedCategory,
}){
    const [title,setTitle] = useState(existingTitle || '');
    const [description,setDescription] = useState(existingDescription || '');
    const [category,setCategory] = useState(assingnedCategory || '');
    const [price,setPrice] = useState(existingPrice || '');
    const [images,setImages] = useState(existingImages || []);
    const [goToProducts,setGoToProducts] = useState(false);
    const [isUploading,setIsUploading] = useState(false);
    const [categories,setCategories] = useState([]);
    const router = useRouter();
    useEffect(()=>{
        axios.get('/api/categories').then(result =>{
            setCategories(result.data);
        })
    }, []);
    async function saveProduct(ev){
        ev.preventDefault();
        const data = {title,description,price,images,category};
        if(_id){
            //update
            await axios.put('/api/products',{...data,_id});
        }else{
            //create
            await axios.post('/api/products', data);
        }
        setGoToProducts(true);
    }
    if (goToProducts){
        router.push('/products');
    }

    async function uploadImages(ev){
        const files =  ev.target?.files;
        if (files?.length > 0){
            setIsUploading(true);
            const data = new FormData();
            for (const file of files){
                data.append('file',file);
            }
            const res = await axios.post('/api/upload',data);
            console.log(res.data);
            setImages(oldImages =>{
                return [...oldImages, ...res.data.links];
            });
            setIsUploading(false);
        }

    }
    function updateIMagesOrder (images){
        setImages(images);
    }
    
    
    return(
            <form onSubmit={saveProduct}>
            
            <label>Nombre del Producto</label>
            <input 
              type='text' 
              placeholder="nombre del producto"
              value={title}
              onChange={ev => setTitle(ev.target.value)}
            />
            <label>Categoria</label>
            <select 
             value={category} 
             onChange={ev => setCategory(ev.target.value)}
             >
                <option value=''>sin categorizar</option>
                {categories.length > 0 && categories.map(c => (
                    <option value={c._id} >{c.name}</option>
                ))}
            </select>
            <label>
                Fotos
            </label>
            <div className= "mb-2 flex flex-wrap gap-1">
                <ReactSortable
                list={images}
                className="flex flex-wrap gap-1"
                setList={updateIMagesOrder}
                >
                {!!images?.length && images.map(link => (
                    <div key={link} className=" h-24 ">
                        <img src={link} className="rounded-lg"></img>
                    </div>
                ))}
                </ReactSortable>
                {isUploading && (
                    <div className="h-24 flex items-center">
                        <Spinner/>
                    </div>
                )}
                <label className= " w-24 h-24 cursor-pointer text-center flex items-center justify-center text-sm gap-1 text-gray-500 rounded-lg bg-gray-200 ">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <div>
                Subir
                </div>
                <input type="file" onChange={uploadImages} className="hidden"/>
                </label>
            </div>
            <label>Descripcion</label>
            <textarea 
              placeholder="descripcion"
              value={description}
              onChange={ev => setDescription(ev.target.value)}
            />
            <label>Precio</label>
            <input 
              type="number" 
              placeholder="precio" 
              value={price}
              onChange={ev => setPrice(ev.target.value)}
              />
            <button 
              type="submit" 
              className="btn-primary">Guardar</button>
              </form>
    )
}