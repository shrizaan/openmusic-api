# MusicOpen API

MusicOpen API is a comprehensive music management system built with Node.js. It provides a robust set of features for managing songs, albums, playlists, and user authentications.

The system is designed with a focus on scalability and efficiency, making it ideal for both small and large-scale music management applications. It includes a variety of API endpoints for managing different aspects of the system, including songs, albums, playlists, and user authentications.

Key features include:

- Song Management: Add, update, delete, and retrieve songs.
- Album Management: Manage albums, including album covers.
- Playlist Management: Create and manage playlists, add songs to playlists, and remove songs from playlists.
- User Authentication: Register and authenticate users.
- Collaboration: Manage collaborations between different users.
- Export: Export playlists for offline use.
- Activity Tracking: Track playlist activities.

The project also includes a set of database migrations for setting up the database schema, and Postman tests for testing the API endpoints.

The project is designed to be easy to set up and run, with detailed instructions provided in the README. It uses npm for dependency management, making it easy to install and update dependencies.

Overall, MusicOpen API provides a robust and scalable solution for music management, making it a great choice for any music-related project.

## Installation

Clone the repository and install the dependencies:

```bash
git clone <your-repo-link>
cd submission-musicopen-api
npm install
```

## Usage

To start the server, run:

```bash
npm start
```

For development mode with hot reloading, run:

```bash
npm run start:dev
```

## Database Migrations

To run the database migrations, use:

```bash
npm run migrate
```

## API Endpoints

The API provides several endpoints for managing songs, albums, playlists, and user authentications. The main modules are:

- Songs: src/api/songs
- Albums: src/api/albums
- Album Likes: src/api/album-likes
- Users: src/api/users
- Authentications: src/api/authentications
- Collaborations: src/api/collaborations
- Export: src/api/export
- Playlists: src/api/playlists
- Playlist Songs: src/api/playlist-songs
- Playlist Activities: src/api/activities

## Contributing

Contributions are welcome. Please make sure to update tests as appropriate.

## License

This project is licensed under the ISC license.
