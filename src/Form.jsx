// יבוא רכיבים וספריות
import { useState, useEffect } from "react";
import Map from './Map';
import { useForm } from "react-hook-form";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { styled } from "@mui/system";

// קומפוננטות מעוצבות לטופס
const FormContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "20px",
  backgroundColor: "#f7f7f7",
  borderRadius: "8px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  maxWidth: "500px",
  margin: "auto",
});

const InputField = styled(TextField)({
  marginBottom: "16px",
  width: "100%",
});

const SubmitButton = styled(Button)({
  backgroundColor: "#6200ea",
  color: "white",
  padding: "12px 20px",
  borderRadius: "8px",
  textTransform: "none",
  "&:hover": {
    backgroundColor: "#3700b3",
  },
});

// קומפוננטת טופס ראשית
const Form = () => {
    // משתני מצב לניהול הטופס והכתובת
    const [query, setQuery] = useState(""); // שאילתה לכתובת
    const [suggestions, setSuggestions] = useState([]); // רשימת הצעות
    const [loading, setLoading] = useState(false); // אינדיקציה לטעינה
    const [error, setError] = useState(null); // טיפול בשגיאות

    const [adress, setAdress] = useState({
        lat: "0.0",
        lon: "0.0",
        display_name: ""
    }); // פרטי הכתובת שנבחרה

    // כלי לניהול טופס
    const { register, handleSubmit, setValue, reset, formState: { isValid, errors } } = useForm({ mode: "all" });

    // פונקציה לטיפול בשינויי כתובת
    const handleAddressChange = (e, value) => {
        setQuery(value);
    };

    // שימוש ב-useEffect לביצוע חיפוש הצעות
    useEffect(() => {
        if (query.trim() === "") {
            setSuggestions([]);
            return;
        }

        const fetchSuggestions = async () => {
            setLoading(true);
            setError(null); 
            try {
                const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`;
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);

                const response = await fetch(url, { signal: controller.signal });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                const formattedData = data.map((item) => ({
                    key: item.place_id || `${item.lat},${item.lon}`,
                    label: item.display_name || "",
                    value: item.display_name || "",
                    lat: item.lat,
                    lon: item.lon
                }));
                setSuggestions(formattedData);
            } catch (err) {
                if (err.name === "AbortError") {
                    setError("Request timed out. Please try again.");
                } else {
                    setError("לא נמצאו תוצאות.");
                }
                setSuggestions([]);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchSuggestions();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [query]);

    // פונקציה לטיפול בשמירת הנתונים
    const save = (data) => {
        console.log("Form submitted successfully:", data);
        console.log("Selected Address:", adress);
        reset(); // ניקוי הטופס לאחר שליחה מוצלחת
        setAdress({ lat: "0.0", lon: "0.0", display_name: "" }); // איפוס הכתובת שנבחרה
        setQuery("");
        setSuggestions([]);
    };

    return (
        <FormContainer>
            {/* טופס */}
            <form noValidate onSubmit={handleSubmit(save)} style={{ width: "100%" }}>
                {/* תיבת חיפוש עם הצעות */}
                <Autocomplete
                    freeSolo
                    options={suggestions}
                    getOptionLabel={(option) => option.label || ""}
                    inputValue={query}
                    onInputChange={handleAddressChange}
                    onChange={(e, value) => {
                        if (value) {
                            setValue("adress", value.value);
                            setQuery(value.label);
                            setAdress({
                                lat: value.lat || "0.0",
                                lon: value.lon || "0.0",
                                display_name: value.label || ""
                            });
                        } else {
                            setAdress({
                                lat: "0.0",
                                lon: "0.0",
                                display_name: ""
                            });
                            setQuery("");
                            setValue("adress", "");
                        }
                    }}
                    renderInput={(params) => (
                        <InputField
                            {...params}
                            label="Address"
                            {...register("adress", { required: "Address is required" })}
                            error={!!errors.adress}
                            helperText={errors.adress?.message || error}
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                    <>
                                        {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                        {params.InputProps.endAdornment}
                                    </>
                                ),
                            }}
                        />
                    )}
                />

                {/* שדה שם */}
                <InputField
                    label="Name"
                    {...register("name", { required: "Name is required" })}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                />

                {/* שדה אימייל */}
                <InputField
                    label="Email"
                    type="email"
                    {...register("email", { required: "Email is required" })}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                />

                {/* שדות צ'קבוקס */}
                <label style={{ marginBottom: "8px" }}>Internet</label>
                <input type="checkbox" {...register("internet")} />

                <label style={{ marginBottom: "8px" }}>Kitchen</label>
                <input type="checkbox" {...register("kitchen")} />

                <label style={{ marginBottom: "8px" }}>Coffee Machine</label>
                <input type="checkbox" {...register("coffe")} />

                {/* שדות נוספים */}
                <InputField
                    label="Number of Rooms"
                    type="number"
                    {...register("numRoom")}
                />

                <InputField
                    label="Distance"
                    type="number"
                    {...register("distance", { required: "Distance is required" })}
                    error={!!errors.distance}
                    helperText={errors.distance?.message}
                />

                {/* כפתור שליחה */}
                <SubmitButton type="submit" disabled={!isValid}>
                    Submit
                </SubmitButton>
            </form>

            {/* הצגת מפה */}
            {adress.lat !== "0.0" && adress.lon !== "0.0" && (
                <Map lat={adress.lat} lon={adress.lon} />
            )}
        </FormContainer>
    );
};

export default Form;
