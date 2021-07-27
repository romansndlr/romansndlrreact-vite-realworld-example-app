import React from 'react'
import { useQuery } from 'react-query'

export default function PopularTags({ onClick }) {
  const { data, isFetching } = useQuery(['/tags', {}], {
    placeholderData: {
      tags: [],
    },
  })
  console.log('DATA:', data)
  return (
    <React.Fragment>
      <div className="sidebar">
        <p>Popular Tags</p>
        {isFetching && <div>Loading tags...</div>}
        {data?.tags?.map((tag) => (
          <a onClick={() => onClick(tag)} href="#" className="tag-pill tag-default">
            {tag}
          </a>
        ))}
      </div>
    </React.Fragment>
  )
}