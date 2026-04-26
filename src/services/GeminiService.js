export const analyzeMealImage = async (base64Image) => {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: base64Image }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to analyze image via backend API');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Backend Analysis Error:", error);
    throw error;
  }
};
