INSERT INTO
    "public"."fonts" ("id", "created_at", "type", "fontImage", "name")
VALUES
    (
        '3',
        '2024-10-14 18:05:08.744164+00',
        'Calibri',
        null,
        'Calibri'
    ),
    (
        '4',
        '2024-10-14 18:05:51.726743+00',
        'Calibri-bold',
        null,
        'Calibri Bold'
    ),
    (
        '5',
        '2024-10-14 18:06:06.969468+00',
        'Calibri-light',
        null,
        'Calibri Light'
    ),
    (
        '6',
        '2024-10-14 18:06:18.088359+00',
        'Cour',
        null,
        'Cour'
    ),
    (
        '7',
        '2024-10-14 18:06:33.638408+00',
        'Exo2',
        null,
        'Exo2'
    ),
    (
        '8',
        '2024-10-14 18:07:49.479004+00',
        'Exo2-italic',
        null,
        'Exo2'
    ),
    (
        '9',
        '2024-10-14 18:08:09.824718+00',
        'Ocra',
        null,
        'Ocra'
    ),
    (
        '10',
        '2024-10-14 18:08:32.650759+00',
        'Inkfree',
        null,
        'Inkfree'
    ),
    (
        '11',
        '2024-10-14 18:10:04.436452+00',
        'PragmaticaExtended',
        null,
        'Pragmatica Extended'
    ),
    (
        '12',
        '2024-10-14 18:10:28.949134+00',
        'PragmaticaExtended-bold',
        null,
        'Pragmatica Extended Bold'
    ),
    (
        '13',
        '2024-10-14 18:10:42.328222+00',
        'PragmaticaExtended-light',
        null,
        'Pragmatica Extended Light'
    );

INSERT INTO
    "public"."frames" (
        "id",
        "created_at",
        "path",
        "name",
        "width",
        "height",
        "maskPath"
    )
VALUES
    (
        '5',
        '2024-10-14 01:19:50.530044+00',
        'https://zckngbdtquzqrmrpjhhx.supabase.co/storage/v1/object/public/frames/public/frames/Frame_Film_01.png',
        'Film 01',
        '902',
        '900',
        'https://zckngbdtquzqrmrpjhhx.supabase.co/storage/v1/object/public/frames/public/masks/Frame_Film_01_Mask.png'
    ),
    (
        '6',
        '2024-10-14 01:23:56.233725+00',
        'https://zckngbdtquzqrmrpjhhx.supabase.co/storage/v1/object/public/frames/public/frames/Frame_Film_02.png',
        'Film 02',
        '979',
        '900',
        'https://zckngbdtquzqrmrpjhhx.supabase.co/storage/v1/object/public/frames/public/masks/Frame_Film_02_Mask.png'
    ),
    (
        '7',
        '2024-10-14 01:38:43.984735+00',
        'https://zckngbdtquzqrmrpjhhx.supabase.co/storage/v1/object/public/frames/public/frames/Frame_Paper_01.png',
        'Paper 01',
        '1394',
        '900',
        'https://zckngbdtquzqrmrpjhhx.supabase.co/storage/v1/object/public/frames/public/masks/Frame_Paper_01_Mask.png'
    ),
    (
        '8',
        '2024-10-14 01:40:01.125241+00',
        'https://zckngbdtquzqrmrpjhhx.supabase.co/storage/v1/object/public/frames/public/frames/Frame_Polaroid_01.png',
        'Polaroid 01',
        '900',
        '1193',
        'https://zckngbdtquzqrmrpjhhx.supabase.co/storage/v1/object/public/frames/public/masks/Frame_Polaroid_01_Mask.png'
    ),
    (
        '9',
        '2024-10-14 01:40:50.083991+00',
        'https://zckngbdtquzqrmrpjhhx.supabase.co/storage/v1/object/public/frames/public/frames/Frame_Polaroid_02.png',
        'Polaroid 02',
        '900',
        '1399',
        'https://zckngbdtquzqrmrpjhhx.supabase.co/storage/v1/object/public/frames/public/masks/Frame_Polaroid_02_Mask.png'
    ),
    (
        '10',
        '2024-10-14 01:42:09.663748+00',
        'https://zckngbdtquzqrmrpjhhx.supabase.co/storage/v1/object/public/frames/public/frames/Frame_Polaroid_03.png',
        'Polaroid 03',
        '900',
        '1098',
        'https://zckngbdtquzqrmrpjhhx.supabase.co/storage/v1/object/public/frames/public/masks/Frame_Polaroid_03_Mask.png'
    );

-- INSERT INTO
--     "public"."templates" ("id", "created_at", "name", "data", "path")
-- VALUES
--     (
--         '20',
--         '2024-10-17 20:30:43.854711+00',
--         'cozy',
--         '"{\\"backgroundImage\\":{\\"path\\":\\"bg_05\\",\\"type\\":\\"Local\\"},\\"items\\":[{\\"id\\":2,\\"dbId\\":5,\\"type\\":\\"frame\\",\\"path\\":\\"https://zckngbdtquzqrmrpjhhx.supabase.co/storage/v1/object/public/frames/public/frames/Frame_Film_01.png\\",\\"width\\":902,\\"height\\":900,\\"y\\":329.08830190180663,\\"x\\":33.94999999999976,\\"z\\":8,\\"scale\\":0.35376701858619397,\\"rotation\\":-0.0019594034212658262,\\"slots\\":[{\\"maskPath\\":\\"https://zckngbdtquzqrmrpjhhx.supabase.co/storage/v1/object/public/frames/public/masks/Frame_Film_01_Mask.png\\",\\"image\\":{\\"url\\":\\"https://zckngbdtquzqrmrpjhhx.supabase.co/storage/v1/object/public/book_photos/50431086-4517-490c-a2bc-634b9f3cf730/2024-10-17/091F120A-44B3-4D2F-A8B6-0069EB4C92DB.webp\\"}}]},{\\"id\\":3,\\"dbId\\":12,\\"type\\":\\"text\\",\\"textContent\\":\\"Waterfall Hike\\",\\"fontSize\\":35.65088653564453,\\"fontColor\\":\\"#262326\\",\\"fontType\\":\\"PragmaticaExtended-bold\\",\\"x\\":55.49998474121094,\\"y\\":190.33335876464844,\\"z\\":9,\\"scale\\":1,\\"rotation\\":0}],\\"screenWidth\\":393,\\"screenHeight\\":852,\\"curId\\":6,\\"maxZIndex\\":14}"',
--         'https://zckngbdtquzqrmrpjhhx.supabase.co/storage/v1/object/public/template_photos/public/cozy_paper/cozy-test.png'
--     ),
--     (
--         '21',
--         '2024-10-17 20:49:15.299692+00',
--         'dark',
--         ''
--     ),
--     (
--         '22',
--         '2024-10-17 22:31:29.140177+00',
--         'grid',
--         '"{\\"backgroundImage\\":{\\"path\\":\\"bg_04\\",\\"type\\":\\"Local\\"},\\"items\\":[{\\"id\\":11,\\"dbId\\":10,\\"type\\":\\"frame\\",\\"path\\":\\"https://zckngbdtquzqrmrpjhhx.supabase.co/storage/v1/object/public/frames/public/frames/Frame_Polaroid_03.png\\",\\"width\\":900,\\"height\\":1098,\\"y\\":100.52232824707033,\\"x\\":59.28334350585939,\\"z\\":26,\\"scale\\":0.30566666666666664,\\"rotation\\":0,\\"slots\\":[{\\"maskPath\\":\\"https://zckngbdtquzqrmrpjhhx.supabase.co/storage/v1/object/public/frames/public/masks/Frame_Polaroid_03_Mask.png\\"}]},{\\"id\\":12,\\"dbId\\":10,\\"type\\":\\"text\\",\\"textContent\\":\\"HBD Jimmy!\\",\\"fontSize\\":31.390531539916992,\\"fontColor\\":\\"darkPrimary\\",\\"fontType\\":\\"Inkfree\\",\\"x\\":143.49998474121094,\\"y\\":376.9999694824219,\\"z\\":27,\\"scale\\":1,\\"rotation\\":0},{\\"id\\":13,\\"dbId\\":6,\\"type\\":\\"text\\",\\"textContent\\":\\"-SEPT. 12 SAT\\",\\"fontSize\\":23.40236473083496,\\"fontColor\\":\\"darkPrimary\\",\\"fontType\\":\\"Cour\\",\\"x\\":40.5,\\"y\\":462.6666717529297,\\"z\\":30,\\"scale\\":1,\\"rotation\\":0},{\\"id\\":14,\\"dbId\\":6,\\"type\\":\\"text\\",\\"textContent\\":\\"Today was  Jimmy’s birthday party, and it was a blast!\\",\\"fontSize\\":21.449697494506836,\\"fontColor\\":\\"darkPrimary\\",\\"fontType\\":\\"Cour\\",\\"x\\":32.166656494140625,\\"y\\":498,\\"z\\":31,\\"scale\\":1,\\"rotation\\":0}],\\"screenWidth\\":393,\\"screenHeight\\":852,\\"curId\\":14,\\"maxZIndex\\":31}"',
--         'https://zckngbdtquzqrmrpjhhx.supabase.co/storage/v1/object/public/template_photos/public/grid/Grid_01.jpg'
--     ),
--     (
--         '23',
--         '2024-10-17 22:34:44.74987+00',
--         'grid 2',
--         '"{\\"backgroundImage\\":{\\"path\\":\\"bg_04\\",\\"type\\":\\"Local\\"},\\"items\\":[{\\"id\\":12,\\"dbId\\":10,\\"type\\":\\"text\\",\\"textContent\\":\\"Friends\\",\\"fontSize\\":27.6627197265625,\\"fontColor\\":\\"darkPrimary\\",\\"fontType\\":\\"Inkfree\\",\\"x\\":163.16664123535153,\\"y\\":355.66665649414057,\\"z\\":44,\\"scale\\":1,\\"rotation\\":-0.15302897090008993},{\\"id\\":15,\\"dbId\\":9,\\"type\\":\\"frame\\",\\"path\\":\\"https://zckngbdtquzqrmrpjhhx.supabase.co/storage/v1/object/public/frames/public/frames/Frame_Polaroid_02.png\\",\\"width\\":900,\\"height\\":1399,\\"y\\":65.51949491373699,\\"x\\":51.28334350585938,\\"z\\":43,\\"scale\\":0.24478835016678283,\\"rotation\\":-0.15231832658353106,\\"slots\\":[{\\"maskPath\\":\\"https://zckngbdtquzqrmrpjhhx.supabase.co/storage/v1/object/public/frames/public/masks/Frame_Polaroid_02_Mask.png\\"}]},{\\"id\\":16,\\"dbId\\":9,\\"type\\":\\"frame\\",\\"path\\":\\"https://zckngbdtquzqrmrpjhhx.supabase.co/storage/v1/object/public/frames/public/frames/Frame_Polaroid_02.png\\",\\"width\\":900,\\"height\\":1399,\\"y\\":372.8528231608073,\\"x\\":154.28331298828124,\\"z\\":41,\\"scale\\":0.24454085154867963,\\"rotation\\":0.09796856765243045,\\"slots\\":[{\\"maskPath\\":\\"https://zckngbdtquzqrmrpjhhx.supabase.co/storage/v1/object/public/frames/public/masks/Frame_Polaroid_02_Mask.png\\"}]},{\\"id\\":17,\\"dbId\\":5,\\"type\\":\\"text\\",\\"textContent\\":\\"SEPT. 12\\\\nSAT 2024\\",\\"fontSize\\":22.69230842590332,\\"fontColor\\":\\"darkPrimary\\",\\"fontType\\":\\"Calibri-light\\",\\"x\\":285.1666717529297,\\"y\\":74,\\"z\\":45,\\"scale\\":1,\\"rotation\\":0}],\\"screenWidth\\":393,\\"screenHeight\\":852,\\"curId\\":17,\\"maxZIndex\\":45}"',
--         'https://zckngbdtquzqrmrpjhhx.supabase.co/storage/v1/object/public/template_photos/public/grid/Grid_02.jpg'
--     );