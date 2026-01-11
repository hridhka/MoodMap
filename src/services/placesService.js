export async function fetchPlaces(mood) {
  const moodMap = {
    work: [
      { name: "Cafe Workspace", rating: 4.6, open: true },
      { name: "Quiet Coffee", rating: 4.4, open: false },
    ],
    date: [
      { name: "Romantic Bistro", rating: 4.7, open: true },
      { name: "Candlelight Dine", rating: 4.5, open: true },
    ],
    quick: [
      { name: "Burger Hub", rating: 4.2, open: true },
      { name: "Quick Bites", rating: 4.1, open: false },
    ],
    budget: [
      { name: "Street Food Point", rating: 4.3, open: true },
      { name: "Budget Meals", rating: 4.0, open: true },
    ],
  };

  return moodMap[mood] || [];
}
