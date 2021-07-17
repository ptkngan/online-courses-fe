/* eslint-disable array-callback-return */
import React, { useState, useEffect, useContext } from "react";
import { Row, Col, Card, Accordion, Modal } from "react-bootstrap";
import { Link, useHistory, useLocation, useParams } from "react-router-dom";
import { Player } from "video-react";
import ImageCustom from "../../guest/ImageCustom/imageCustom";
import { FiShoppingCart } from "react-icons/fi";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { TiStarOutline, TiStarFullOutline } from "react-icons/ti";
import { RiVideoLine } from "react-icons/ri";
import Rating from "react-rating";
import numeral from "numeral";
import moment from "moment";
import "../../guest/Course/course.css";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
// import { _course, _courses } from "../HomePage/data";
import RatingChart from "../../guest/RatingChart/ratingChart";
import request from "../../../configs/request";
import { appContext } from "../../../contexts/AppContext";
import { ADD_ITEM_TO_CART, REMOVE_ITEM_IN_CART } from "../../../constants";
import { authContext } from "../../../contexts/AuthContext";
import "./studentCourse.css";

const Lectures = ({ lectures, onShowPreview, isPreview }) => {
  return (
    <div className="course-lecture">
      {lectures &&
        lectures.sort((a,b)=>a.number_order - b.number_order).map((lecture, index) => {
          return (
            <Card.Body
              key={index}
              className={`course-lecture-item ${
                lecture.preview || isPreview ? "preview" : ""
              }`}
            >
              <span className="course-lecture-icon">
                <RiVideoLine />
              </span>
              <span className="course-wrap-name">
                <span
                  className={`course-lecture-name`}
                  onClick={
                    lecture.preview || isPreview
                      ? () => onShowPreview(lecture)
                      : () => {}
                  }
                >
                  {`Lesson ${lecture.number_order}: ${lecture.name}`}
                </span>
                <span>{numeral(lecture.duration).format("00:00")}</span>
              </span>
            </Card.Body>
          );
        })}
    </div>
  );
};

const VideoModal = (props) => {
  const { show, onHide, lecture, course } = props;
  const [link, setLink] = useState(null);

  useEffect(() => {
    if (lecture && lecture.video && lecture.video.link) {
      setLink(lecture.video.link);
    }
  }, [lecture]);

  useEffect(()=>{
    setLink(null);
  },[show]);

  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header>
        <Modal.Title id="contained-modal-title-vcenter">
          {lecture ? lecture.name : ""}
        </Modal.Title>
      </Modal.Header>
      {link && (
       <Modal.Body>
        <Player
          playsInline
          autoPlay
          poster={course.picture}
          src={link}
        />
      </Modal.Body>
      )}
     
      <Modal.Footer>
        <button className="btn-cs btn-primary-cs" onClick={() => onHide()}>
          Close
        </button>
      </Modal.Footer>
    </Modal>
  );
};

function StudentCourse() {
  const { store, dispatch } = useContext(appContext);
  const { auth } = useContext(authContext);
  const { user, role } = auth;
  const [liked, setLiked] = useState(false);
  const [course, setCourse] = useState(null);
  const [watchList, setWatchList] = useState([]);
  const location = useLocation();
  const history = useHistory();
  const [chapters, setChapters] = useState({
    chapters: [],
    page: 0,
    totalPage: 0,
  });
  const [feedbacks, setFeedbacks] = useState({
    feedbacks: [],
    page: 0,
    totalPage: 0,
  });
  const [show, setShow] = useState(false);
  const [lecture, setLecture] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    loadWatchList();
  }, [user]);

  useEffect(() => {
    if (watchList.length > 0 && id && watchList.find((c) => c.id === id)) {
      setLiked(true);
    } else {
      setLiked(false);
    }
  }, [watchList, id]);

  const loadStudentCourse = async (id) => {
    const res = await request({
      method: "GET",
      url: `/courses/${id}`,
    });
    if (res.code) {
      setCourse(res.data);
    }
  };

  const loadChapters = async (id) => {
    const res = await request({
      method: "GET",
      url: `/courses/${id}/chapters`,
      params: {
        page: chapters.page + 1,
        limit: 10,
      },
    });
    if (res.code) {
      setChapters({
        chapters: res.data.rows,
        page: res.pageNumber,
        totalPage: Math.floor(res.data.count / res.pageSize) + 1,
      });
    }
  };

  const loadFeedbacks = async (id) => {
    const res = await request({
      method: "GET",
      url: `/courses/${id}/feedbacks`,
      params: {
        feedbacks: feedbacks.page + 1,
        limit: 10,
      },
    });
    if (res.code) {
      setFeedbacks({
        feedbacks: res.data.rows,
        page: res.pageNumber,
        totalPage: Math.floor(res.data.count / res.pageSize) + 1,
      });
    }
  };

  const loadLesson = async (id) => {
    const res = await request({
      method: "GET",
      url: `/lesson/${id}`,
    });
    if (res.code) {
      setLecture(res.data);
    }
  };

  const loadWatchList = async () => {
    const res = await request({
      method: "GET",
      url: `/courses/watch-list`,
    });

    if (res.code) {
      setWatchList(res.data.rows);
    } else {
      setWatchList([]);
    }
  };

  useEffect(() => {
    if (id) {
      loadStudentCourse(id);
      loadChapters(id);
      loadFeedbacks(id);
    }
  }, [location]);


  const onShowPreview = (lecture) => {
    loadLesson(lecture.id);
    // setLecture(lecture);
    setShow(true);
  };

  const calcLecturesDurationTotal = (lectures) => {
    if (lectures) {
      let total = 0;
      lectures.forEach((l) => {
        total += l.duration;
      });
      return total;
    }
    return 0;
  };

  if (!course) return null;
  else
    return (
      <>
        <VideoModal
          show={show}
          onHide={()=>setShow(false)}
          lecture={lecture}
          course={course}
        />
        <div className="course-head">
          <Row className="course-row-head">
            <Col md="12" className="left">
              <div>
                <ImageCustom
                  width="100%"
                  className="card-25-9"
                  src={course.picture}
                />
              </div>
              <div className="course-info-head">
                <div className="course-wrap-badge">
                  {(course.isNew || course.isMostEnrolled) && (
                    <span
                      className={`card-badge course-badge ${
                        course.isNew ? "new" : "best-seller"
                      }`}
                    >
                      {course.isNew ? "New" : "Best seller"}
                    </span>
                  )}
                </div>
                <h3>
                  <span>{course.course_name}</span>
                </h3>
                <div>{course.short_description || course.description}</div>
                <div className="course-rating-head">
                  <Rating
                    emptySymbol={<TiStarOutline />}
                    fullSymbol={<TiStarFullOutline />}
                    readonly
                    initialRating={course.rating}
                    style={{ fontSize: "1.1rem", color: "#eb910a" }}
                  />
                  <small className="text-number">{` (${numeral(
                    course.ratings || course.number_rating
                  ).format("0,0")})`}</small>
                </div>
                <div>
                  Teacher{" "}
                  <Link className="" to={`/teacher?id=${course.teacher_id}`}>
                    {course.teacher_name}
                  </Link>
                </div>
                <div>
                  Last updated:{" "}
                  <span className="text-number">
                    {course.last_update || moment(course.updateAt).format("L")}
                  </span>
                </div>
              </div>
            </Col>
          </Row>
        </div>
        <div className="course-body">
          <div className="course-content">
            <div className="flex-between-center">
              <h3>Course Content</h3>
              <small>{course.status === 1 ? "Full section" : "Updating"}</small>
            </div>
            <Accordion defaultActiveKey="0" className="course-section">
              {chapters.chapters.length > 0 &&
                chapters.chapters.map((section, index) => {
                  return (
                    <Card key={index}>
                      <Accordion.Toggle
                        as={Card.Header}
                        eventKey={index + 1}
                        className="flex-between-center"
                      >
                        <div className="section-name">{`Section ${
                          /*section.stt*/ index + 1
                        }: ${/*section.name*/ section.chapter_name}`}</div>
                        <div>{`${
                          /*section.lectures.length ||*/ section.lessons.length
                        } lectures • ${numeral(
                          calcLecturesDurationTotal(
                            /*section.lectures*/ section.lessons
                          )
                        ).format("00:00")}`}</div>
                      </Accordion.Toggle>
                      <Accordion.Collapse eventKey={index + 1}>
                        <Lectures
                          lectures={/*section.lectures*/ section.lessons}
                          onShowPreview={onShowPreview}
                          isPreview={true}
                        />
                      </Accordion.Collapse>
                    </Card>
                  );
                })}
            </Accordion>
            {chapters.chapters.length === 0 && (
              <div className="text-not-found">Content has not been updated</div>
            )}
            {chapters.page < chapters.totalPage && (
              <div className="flex-center mt-2">
                <button className="btn-cs btn-primary-cs">
                  Show more contents
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="course-body">
          <h3>Course Reviews</h3>
          <div className="course-feedback">
            <div className="flex-start-center">
              <div className="course-rating-point">
                <span className="text-rating-number">{course.rating}</span>
                <Rating
                  emptySymbol={<TiStarOutline />}
                  fullSymbol={<TiStarFullOutline />}
                  readonly
                  initialRating={course.rating}
                  style={{ fontSize: "1.1rem", color: "#eb910a" }}
                />
                <span>{"Course Rating"}</span>
              </div>
              <div className="course-rating-chart">
                {/* <RatingChart chart={course.rating_chart} total={course.ratings} /> */}
              </div>
            </div>
            <div className="course-review">
              {
                /*course.reviews &&*/
                feedbacks.feedbacks.map((review, index) => {
                  return (
                    <div className="course-review-item" key={index}>
                      <span className="course-wrap-review-img">
                        <ImageCustom
                          width="48px"
                          height="48px"
                          borderRadius="50%"
                        />
                      </span>
                      <div className="">
                        <div>
                          {review.user_name || review.user
                            ? review.user.fullname
                            : ""}
                        </div>
                        <div>
                          <Rating
                            emptySymbol={<TiStarOutline />}
                            fullSymbol={<TiStarFullOutline />}
                            readonly
                            initialRating={review.rating}
                            style={{ fontSize: "1.1rem", color: "#eb910a" }}
                          />{" "}
                          <small>{`  ${moment(
                            /*review.review_at*/
                            review.updatedAt
                          ).fromNow()}`}</small>
                        </div>
                        <div>{review.content}</div>
                      </div>
                    </div>
                  );
                })
              }
            </div>
            {feedbacks.feedbacks.length > 0 &&
              feedbacks.page < feedbacks.totalPage && (
                <div className="flex-center mt-2">
                  <button className="btn-cs btn-primary-cs">
                    Show more reviews
                  </button>
                </div>
              )}
            {feedbacks.feedbacks.length === 0 && (
              <div className="flex-center mt-2">
                <small></small>
              </div>
            )}
            <h3>Feedback</h3>
            <textarea className="textarea-feedback" name="feedback" rows="4">
              Excellent course! Really satisfied!
            </textarea>
            <div className="flex-between-center">
              <Rating
                emptySymbol={<TiStarOutline />}
                fullSymbol={<TiStarFullOutline />}
                initialRating={5}
                style={{ fontSize: "2rem", color: "#eb910a" }}
              />
              <button className="btn-cs btn-primary-cs">Post review</button>
            </div>
          </div>
        </div>
      </>
    );
}

export default StudentCourse;
