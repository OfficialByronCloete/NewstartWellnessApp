# NewstartWellnessApp

## Progress update

**2026-04-16**

- Added Tailwind, ng-icons and implemented some initial styling focusing on the login and home components.
- Moved the nav bar to a separate component and added it to other components.
- Modified the Achievements component to allow for unlimited attempts of each challenge. This includes new HTML elements to be able to add attempts or reset the number for each challenge individually and a save button for the entire form.
- Added placeholders for API calls to backend in the Achievements and home components.

**2026-04-15**

- Home, Information, Achievement, Leaderboard and Login pages added.
- Placeholder login guard added.
- Home page points bar and score breakdown added.
- Achievements form added.

**2026-04-12**

- Aspire AppHost now launches the Web API and Angular frontend together.
- Backend Swagger/OpenAPI is enabled for local development.
- Backend CORS allows the Angular dev server at `http://localhost:4200`.
- WeatherForecast sample boilerplate has been removed from the Web API.
