import React from "react"
import PropTypes from 'prop-types'
import { Link } from "react-router-dom"
import { Row, Col, BreadcrumbItem } from "reactstrap"

const Breadcrumb = props => {
  return (
    <Row>
      <Col xs={12}>
        <div className="page-title-box d-sm-flex align-items-center justify-content-between">
          <h5 className="mb-sm-4 fs-4">{props.breadcrumbItem}</h5>
        </div>
      </Col>
    </Row>
  )
}

Breadcrumb.propTypes = {
  breadcrumbItem: PropTypes.string,
  title: PropTypes.string
}

export default Breadcrumb
