/*
    d4vd.vault
    Album database

    Folder structure:

    albums/
    └── decay-ep/
        ├── cover.png
        ├── 01-issues.mp3
        ├── 02-how-i-see-you.mp3
        ├── 03-take-the-photos.mp3
        ├── 04-summer-dont-end.mp3
        ├── 05-empty-the-clip.mp3
        └── 06-im-in-love.mp3
*/

const albums = [

    {
        id: "decay-ep",

        name: "Decay EP",

        type: "EP",

        folder: "decay-ep",

        cover: "cover.png",

        tracks: [
            {
                title: "Issues",
                file: "01-issues.mp3",
                status: "EP"
            },

            {
                title: "How I See You",
                file: "02-how-i-see-you.mp3",
                status: "EP"
            },

            {
                title: "Take The Photos",
                file: "03-take-the-photos.mp3",
                status: "EP"
            },

            {
                title: "Summer Don't End",
                file: "04-summer-dont-end.mp3",
                status: "EP"
            },

            {
                title: "Empty The Clip",
                file: "05-empty-the-clip.mp3",
                status: "EP"
            },

            {
                title: "I'm In Love",
                file: "06-im-in-love.mp3",
                status: "EP"
            }
        ]
    }

];
