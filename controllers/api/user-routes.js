const router = require( 'express' ).Router();
const { User, Post, Comment } = require( '../../models' );
const withAuth = require( '../../utils/auth' );

// GET /api/users
router.get('/', ( req, res ) => {
    // access User model and run .findAll() method
    User.findAll( {
        attributes: { exclude: [ 'password' ] }
    } )
        .then( dbUserData => res.json( dbUserData ) )
        .catch( err => {
            console.log( err );
            res.status( 500 ).json( err );
        } );
} );

// GET /api/users/1
router.get('/:id', ( req, res ) => {
    User.findOne( {
        include: [
            {
                model: Post,
                attributes: ['id', 'title', 'post_content', 'created_at']
            },
            {
                model: Comment,
                attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
                include: {
                    model: Post,
                    attributes: ['title']
                }
            }
            
        ],
        attributes: { exclude: [ 'password' ] },
        where: {
            id: req.params.id
        }
    } )
    .then( dbUserData => {
        if( !dbUserData ) {
            res.status( 404 ).json( { message: 'No user found with this id' } );
            return;
        }
        res.json( dbUserData );
    } )
    .catch( err => {
        console.log( err );
        res.status( 500 ).json( err );
    })
} );

// POST /api/users
router.post('/', ( req, res ) => {
    // expects { username: 'bbb', email: 'bbb', password: 'bbb' }
    User.create( { 
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    } )
    .then( dbUserData => {
        req.session.save( () => {
            req.session.user_id = dbUserData.id;
            req.session.username = dbUserData.username;
            req.session.loggedIn = true;

            res.json( dbUserData )
        } )
    } )
    .catch( err => {
        console.log( err )
        res.status( 500 ).json( err );
    } );
} );

// login route uses POST so the password is sent in body, rather than url params
router.post( '/login', ( req, res ) => {
    //user input expects {email: 'blah@blah.com, password: 'blah123 '}
    User.findOne( {
        where: {
            email: req.body.email
        }
    } )
    .then( dbUserData => {
        if( !dbUserData ) {
            res.status( 400 ).json( { message: 'No user with that email address!' } );
            return;
        }

        // verify user
        const validPassword = dbUserData.checkPassword( req.body.password );
        if( !validPassword ) {
            res.status( 400 ).json( { message: 'Incorrect Password!' } );
            return;
        }
        
        req.session.save( () => {
            req.session.user_id = dbUserData.id;
            req.session.username = dbUserData.username;
            req.session.loggedIn = true;
            res.json( { user: dbUserData.username, message: 'You are now logged in!' } );
        } );
    } );
} );

// logout route to destroy cookie
router.post( '/logout', withAuth, ( req, res ) => {
    if( req.session.loggedIn ){
        req.session.destroy( () => {
            res.status( 204 ).end();
        } );
    } else {
        res.status( 404 ).end();
    }
} )

// PUT /api/users/1
router.put('/:id', withAuth, ( req, res ) => { 
    // expects { username: 'bbb', email: 'bbb', password: 'bbb' }

    // if req.body has exact key/val match the model, can just use req.body instead
    User.update( req.body, {
        individualHooks: true,
        where: {
            id: req.params.id
        }
    } )
    .then( dbUserData => {
        if( !dbUserData[0] ) {
            res.status( 404 ).json( { message: 'No user found with this id' } );
            return;
        }
        res.json( dbUserData )
    } )
    .catch( err => {
        console.log( err )
        res.status( 500 ) .json( err )
    } );
 } );

// DELETE /api/users/1
router.get('/:id', withAuth, ( req, res ) => {
    User.destroy( {
        where: {
            id: req.params.findOne
        }
    } )
    .then( dbUserData => {
        if( !dbUserData ) {
            res.status( 404 ).json( { message: 'No user found with this id' } );
            return;
        }
        res.json( dbUserData );
    } )
    .catch( err => {
        console.log( err )
        res.status( 500 ).json( err )
    } );
} );


module.exports = router;