const router = require( 'express' ).Router();
const { Comment } = require( '../../models' );
const withAuth = require( '../../utils/auth' );

router.get( '/', ( req, res ) => {
    Comment.findAll({})
    .then( dbCommentData => res.json( dbCommentData ) )
    .catch( err => {
        console.log( err );
        res.status( 400 ).json( err );
    } );

} );

router.post( '/', withAuth, ( req, res ) => {
        // check for session
    if( req.session ) {
        Comment.create( {
            comment_text: req.body.comment_text,
            user_id: req.session.user_id,
            post_id: req.body.post_id
        } )
        .then( dbCommentData => res.json( dbCommentData ) )
        .catch( err => {
            console.log( err );
            res.status( 400 ).json( err );
        } );
    }
} );

router.delete( '/:id', withAuth, ( req, res ) => {
    const { id } = req.params;
    Comment.destroy({
        where: {
            id
        }
    } )
    .then( dbCommentData => res.json( dbCommentData ) )
    .catch( err => {
        console.log( err );
        res.status( 400 ).json( err );
    } );

} );

module.exports = router;