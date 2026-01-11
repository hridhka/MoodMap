function PlacesList({ places }) {
  return (
    <ul>
      {places.map((place, index) => (
        <li key={index}>
          <strong>{place.name}</strong>
        </li>
      ))}
    </ul>
  );
}

export default PlacesList;
