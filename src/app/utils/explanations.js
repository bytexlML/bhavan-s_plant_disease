export const PLANT_CLASSES = [
    "Apple___Apple_scab", "Apple___Black_rot", "Apple___Cedar_apple_rust", "Apple___healthy",
    "Blueberry___healthy", "Cherry_(including_sour)___Powdery_mildew", "Cherry_(including_sour)___healthy",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot", "Corn_(maize)___Common_rust_",
    "Corn_(maize)___Northern_Leaf_Blight", "Corn_(maize)___healthy", "Grape___Black_rot",
    "Grape___Esca_(Black_Measles)", "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)", "Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)", "Peach___Bacterial_spot", "Peach___healthy",
    "Pepper,_bell___Bacterial_spot", "Pepper,_bell___healthy", "Potato___Early_blight",
    "Potato___Late_blight", "Potato___healthy", "Raspberry___healthy", "Soybean___healthy",
    "Squash___Powdery_mildew", "Strawberry___Leaf_scorch", "Strawberry___healthy",
    "Tomato___Bacterial_spot", "Tomato___Early_blight", "Tomato___Late_blight", "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot", "Tomato___Spider_mites Two-spotted_spider_mite",
    "Tomato___Target_Spot", "Tomato___Tomato_Yellow_Leaf_Curl_Virus", "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy"
];

export const EXPLANATIONS = {
    "Apple___Apple_scab": {
        "cause": "Fungus (Venturia inaequalis)",
        "category": "Fungal",
        "symptoms": "Olive-green to black spots on leaves and fruit, often appearing velvety.",
        "scientific_reason": "The fungus overwinters in fallen leaves and infects new growth during wet spring weather.",
        "precaution": "Remove fallen leaves in autumn; prune trees to improve air circulation.",
        "recommended_action": "Apply fungicides like Myclobutanil or Captan during the early growing season.",
        "nutrient_correction": "Ensure balanced Nitrogen levels; excessive Nitrogen can promote susceptible flush growth."
    },
    // ... rest will be populated similarly
};

// Populate the rest in JS to keep the file size manageable or use the full set
const DEFAULT_EXPLANATION = {
    "cause": "Pathogen/Environmental Stress",
    "category": "To be determined",
    "symptoms": "Visible discoloration or damage on leaf surface.",
    "scientific_reason": "The plant is reacting to external stress or biological infection.",
    "precaution": "Isolate the plant, avoid water-to-leaf contact.",
    "recommended_action": "Consult a local agricultural expert; consider organic neem oil spray.",
    "nutrient_correction": "Check N-P-K levels in soil."
};

PLANT_CLASSES.forEach(plant => {
    if (!EXPLANATIONS[plant]) {
        if (plant.includes("healthy")) {
            const name = plant.split("___")[0].replace(/_/g, " ");
            EXPLANATIONS[plant] = {
                "cause": "None",
                "category": "Healthy",
                "symptoms": "Green, vibrant leaves with no visible spots or discoloration.",
                "scientific_reason": "The plant is receiving optimal nutrients and is free from pathogens.",
                "precaution": "Maintain regular watering and fertilization schedule.",
                "recommended_action": "Continue current cultivation practices; monitor for early signs of pests.",
                "nutrient_correction": "Maintain current nutrient balance."
            };
        } else {
            const diseaseName = plant.split("___")[1].replace(/_/g, " ");
            EXPLANATIONS[plant] = {
                ...DEFAULT_EXPLANATION,
                "symptoms": `Symptoms characteristic of ${diseaseName} observed on leaves.`
            };
        }
    }
});
