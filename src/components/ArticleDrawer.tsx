import { Box, Divider, Drawer, Typography } from '@mui/material'
import { makeStyles } from '@mui/styles'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { getExpDate } from '../lib/decodeJWT'
import { clearArticle, fetchLatestArticle, selectLatestArticle } from '../state/article/articleSlice'
import { closeDrawer, selectIsDrawerOpen } from '../state/drawer/drawerSlice'
import { AppDispatch } from '../state/store'
import { fetchToken, selectToken } from '../state/token/tokenSlice'

const useStyles = makeStyles({
  container: {
    width: '25vw',
  },
  content: {
    paddingLeft: 12,
    paddingRight: 12,
  },
  title: {
    marginBottom: '8px',
    backgroundColor: '#5CB85B',
    color: 'white',
    paddingTop: 14,
    paddingBottom: 14,
    paddingLeft: 12,
    paddingRight: 12,
  },
  metaData: {
    marginBottom: '12px',
    fontStyle: 'italic',
  },
  summary: {
    whiteSpace: 'pre-line',
  },
})

export default function ArticleDrawer() {
  const classes = useStyles()
  const dispatch: AppDispatch = useDispatch()
  const isDrawerOpen = useSelector(selectIsDrawerOpen)
  const latestArticle = useSelector(selectLatestArticle)
  const token = useSelector(selectToken)
  const tokenExpired = token ? getExpDate(token) < new Date() : true

  useEffect(() => {
    if (isDrawerOpen && tokenExpired) {
      console.log('Refreshing token...')
      dispatch(fetchToken()).then(() => {
        dispatch(clearArticle())
      })
    }
  }, [dispatch, isDrawerOpen, token, tokenExpired])

  useEffect(() => {
    if (isDrawerOpen && token && !latestArticle) {
      console.log('New article...')
      dispatch(fetchLatestArticle())
    }
  }, [dispatch, isDrawerOpen, token, latestArticle])

  function formatArticleContent(content) {
    const wordLimit = 200
    const words = content.split(/\s+/)

    if (words.length > wordLimit) {
      return (
        <>
        {/*example: supposed to navigate to the full article */}
          {words.slice(0, wordLimit).join(' ')}...
          <Link to="/" style={{ textDecoration: 'none' }}>
            Read more
          </Link>
        </>
      )
    } else {
      return content
    }
  }

  return (
    <Drawer anchor="left" open={isDrawerOpen} onClose={() => dispatch(closeDrawer())}>
      {latestArticle ? (
        <Box className={classes.container}>
          <Typography variant="h5" component="h2" className={classes.title}>
            {latestArticle.title}
          </Typography>
          <Box className={classes.content}>
            <Typography variant="body2" component="p" className={classes.metaData}>
              Author: {latestArticle.author}
              <br />
              Date Published: {new Date(latestArticle.datePublished).toLocaleDateString()}
            </Typography>
            <Divider />
            <Typography variant="body1" component="p" className={classes.summary}>
              {formatArticleContent(latestArticle.content)}
            </Typography>
          </Box>
        </Box>
      ) : (
        <Box className={classes.content}>
          <Typography variant="body1" component="p">
            Loading...
          </Typography>
        </Box>
      )}
    </Drawer>
  )
}
