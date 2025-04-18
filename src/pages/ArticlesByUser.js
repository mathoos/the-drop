import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getObjectsByUser, updateObject, deleteObject } from "../utilities/Server"; 

import Navbar from '../components/Navbar';
import Form from '../components/Form';

import './Dashboard.scss';

const ArticlesByUser = () => {
    const token = useSelector((state) => state.user.token);
    const navigate = useNavigate();
    const { id } = useParams(); 
    const [things, setThings] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [selectedThing, setSelectedThing] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            const data = await getObjectsByUser(id, token);
            setThings(data); 
        } catch (error) {
            console.error("Erreur lors de la récupération des objets :", error);
        }
    }, [id, token]);

    useEffect(() => {
        if (!token) {
            navigate('/');
        }
        fetchData();
    }, [token, id, navigate, fetchData]);

    const handleEditButtonClick = (thing) => {
        setSelectedThing(thing);
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setSelectedThing(null);
    };

    const handleEditObjectFormSubmit = async (event, formData) => {
        event.preventDefault();
        
        if (!selectedThing) return;
    
        try {
            const updatedData = new FormData();
            updatedData.append("title", formData.title);
            updatedData.append("subtitle", formData.subtitle);
            updatedData.append("description", formData.description);
            updatedData.append("tag", formData.tag);
            updatedData.append("published", formData.published);
    
            // Vérifie si une nouvelle image a été uploadée
            if (formData.image) {
                updatedData.append("image", formData.image); 
            }
    
            await updateObject(selectedThing._id, updatedData, token);
    
            await fetchData(); 
    
            setShowForm(false);
            setSelectedThing(null);
        } catch (error) {
            console.error("Erreur lors de la mise à jour de l'article :", error);
        }
    };

    const handleDeleteButtonClick = async (thingId) => {
        if (!window.confirm("Voulez-vous vraiment supprimer cet article ?")) {
            return; // Annuler la suppression si l'utilisateur clique sur "Annuler"
        }
    
        try {
            await deleteObject(thingId, token);
            await fetchData(); // Rafraîchir la liste après suppression
        } catch (error) {
            console.error("Erreur lors de la suppression de l'article :", error);
        }
    };
    
    const handleViewArticle = (thingId) => {
        navigate(`/article/${thingId}`);
    };
    
    
    

    return (
        <div className="dashboard">
            <div className="dashboard_container">
                <Navbar />

                {showForm ? (
                    <Form
                        title="Modifier un article"
                        handleSubmit={handleEditObjectFormSubmit}
                        handleClose={handleCloseForm}
                        modalActive={true}
                        initialData={selectedThing ? {
                            title: selectedThing.title || '',
                            subtitle: selectedThing.subtitle || '',
                            description: selectedThing.description || '',
                            tag: selectedThing.tag || '',
                            image: selectedThing.imageUrl || '',
                            published: Boolean(selectedThing.published) 
                        } : {}}
                    />
                ) : (
                    <div className="dashboard_container-content">
                        <div className="dashboard_container-content--user">
                            <h2>Tous mes articles</h2>
                        </div>

                        <div className="dashboard_container-content--stuff">
                            <div className="card">
                                <div className="card_image">
                                    <p className="card_text-title">Image</p>
                                </div>
                                <div className="card_text">
                                    <p className="card_text-title">Titre</p>
                                    <p className="card_text-title">Sous-titre</p>
                                    <p className="card_text-title">Statut</p>
                                    <p className="card_text-title">Date</p>
                                </div>
                              
                            </div>
                            {things.length > 0 ? (
                                things.map(thing => (
                                    <div key={thing._id} className="card">
                                        <img src={thing.imageUrl} alt={thing.title} />
                                        <div className="card_text">
                                            <p className="card_text-content">{thing.title}</p>
                                            <p className="card_text-content subtitle">{thing.subtitle}</p>
                                            <p className="card_text-content">
                                                {thing.published ? "Publié" : "Brouillon"}
                                            </p>
                                            <p className="card_text-content">{new Date(thing.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        
                                        <div className="card_buttons">
                                            <button 
                                                className="bouton bouton_gris bouton_petit" 
                                                onClick={() => handleViewArticle(thing._id)}
                                            >
                                                Voir
                                            </button>
                                            <button 
                                                className="bouton bouton_gris bouton_petit" 
                                                onClick={() => handleEditButtonClick(thing)}
                                            >
                                                Modifier
                                            </button>
                                            <button 
                                                className="bouton bouton_primary bouton_petit" 
                                                onClick={() => handleDeleteButtonClick(thing._id)}
                                            >
                                                Supprimer
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p>Vous n'avez créé aucun objet.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ArticlesByUser;
