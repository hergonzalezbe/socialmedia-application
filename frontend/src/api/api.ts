import axios from 'axios';

export const authApi=axios.create({
    baseURL:'http://localhost:3000',
    headers:{
        "Content-Type":"application/json"
    },
});

export const postApi=axios.create({
    baseURL:'http://localhost:3001',
    headers:{
        "Content-Type":"application/json"
    }
});

export const getAuthHeaders=(token:string)=>({
    headers:{
        Authorization:`Beader ${token}`,
    }
});