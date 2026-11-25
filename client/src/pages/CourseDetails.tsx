import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  Award,
  BarChart3,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Globe,
  Infinity as InfinityIcon,
  PlayCircle,
  SearchX,
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import type { Course, CreateOrderResponse } from "../types";
import { formatPrice, imageUrl, initials } from "../utils/format";
import {
  CheckoutCancelled,
  loadRazorpayScript,
  openCheckout,
} from "../types/razorpay";

function DetailSkeleton() {
  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <div className="skeleton h-4 w-48" />
        <div className="skeleton h-10 w-4/5" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton mt-6 h-48 w-full" />
        <div className="skeleton h-16 w-full" />
        <div className="skeleton h-16 w-full" />
      </div>
      <div className="skeleton h-96 w-full" />
    </div>
  );
}

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState<Set<number>>(new Set([0]));

  useEffect(() => {
    const loadCourse = async () => {
      setLoading(true);
      try {
        const res = await api.get<Course>(`/courses/${id}`);
        setCourse(res.data);
      } catch {
        setCourse(null);
      } finally {
        setLoading(false);
      }
    };

    void loadCourse();
  }, [id]);

  useEffect(() => {
    if (!user) {
      setEnrolled(false);
      return;
    }
    const loadEnrollment = async () => {
      try {
        const res = await api.get<Course[]>("/enroll/my-courses");
        setEnrolled(res.data.some((c) => c._id === id));
      } catch {
        console.log()
      }
    };

    void loadEnrollment();
  }, [user, id]);

  const handleBuy = async () => {
    if (!course) return;

    if (!user) {
      navigate("/login", { state: { from: `/courses/${id}` } });
      return;
    }

    setBuying(true);
    setError("");

    try {
      if (course.price === 0) {
        // free course: enroll directly
        await api.post(`/enroll/${course._id}`);
      } else {
        // 1. ask the backend to create an order (price comes from the DB)
        const { data: order } = await api.post<CreateOrderResponse>(
          "/payment/create-order",
          {
            courseId: course._id,
          },
        );

        // 2. open the Razorpay popup
        const loaded = await loadRazorpayScript();
        if (!loaded)
          throw new Error(
            "Could not load the payment gateway. Check your internet.",
          );

        const result = await openCheckout({
          key: order.keyId,
          order_id: order.orderId,
          amount: order.amount,
          currency: order.currency,
          name: "CourseHub",
          description: order.courseTitle,
          prefill: { name: user.name, email: user.email },
          theme: { color: "#6366f1" },
        });

        // 3. the backend verifies the signature, confirms the payment and enrolls the user
        try {
          await api.post("/payment/verify", result);
        } catch (err) {
          const msg = axios.isAxiosError(err)
            ? err.response?.data?.message
            : "";
          throw new Error(
            `${msg || "Verification failed"}. If money was deducted, please contact support with payment ID ${result.razorpay_payment_id}.`,
            { cause: err },
          );
        }
      }

      setEnrolled(true);
      navigate("/my-courses");
    } catch (err) {
      if (err instanceof CheckoutCancelled) {
        setError("Payment was cancelled. You have not been charged.");
      } else if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message ?? "Purchase failed");
        // backend says already enrolled: sync the button
        if (err.response?.status === 409) setEnrolled(true);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Purchase failed");
      }
    } finally {
      setBuying(false);
    }
  };

  if (loading) return <DetailSkeleton />;

  if (!course) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
        <SearchX size={44} className="text-muted" />
        <h1 className="mt-4 text-2xl font-bold">Course not found</h1>
        <p className="mt-1 text-muted">
          It may have been removed or the link is wrong.
        </p>
        <Link
          to="/courses"
          className="mt-6 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white"
        >
          Browse courses
        </Link>
      </div>
    );
  }

  const curriculum = course.curriculum ?? [];
  const learn = course.whatYouWillLearn ?? [];
  const totalLessons = curriculum.reduce((n, m) => n + m.lessons.length, 0);
  const allOpen = curriculum.length > 0 && open.size === curriculum.length;

  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const toggleAll = () =>
    setOpen(allOpen ? new Set() : new Set(curriculum.map((_, i) => i)));

  const action = (
    <>
      {enrolled ? (
        <Link
          to="/my-courses"
          className="block rounded-md bg-[#287a60] py-3 text-center font-semibold text-white transition-colors duration-150 hover:bg-[#20644f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Enrolled · View my courses
        </Link>
      ) : (
        <button
          onClick={handleBuy}
          disabled={buying}
          className="w-full rounded-md bg-primary py-3 font-semibold text-white transition-colors duration-150 hover:bg-primary-hover disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {buying
            ? "Processing..."
            : course.price === 0
              ? "Enroll for Free"
              : "Buy Now"}
        </button>
      )}
    </>
  );

  const includes = [
    { icon: Clock, text: `${course.duration} of content` },
    { icon: BarChart3, text: `${course.level} level` },
    { icon: Globe, text: `${course.mode} mode` },
    { icon: InfinityIcon, text: "Lifetime access" },
    { icon: Award, text: "Certificate of completion" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-28 sm:px-6 lg:pb-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex flex-wrap items-center gap-1 text-sm text-muted">
        <Link to="/" className="hover:text-fg focus-visible:outline-2 focus-visible:outline-primary">
          Home
        </Link>
        <ChevronRight size={14} />
        <Link to="/courses" className="hover:text-fg focus-visible:outline-2 focus-visible:outline-primary">
          Courses
        </Link>
        <ChevronRight size={14} />
        <span className="line-clamp-1 text-fg">{course.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* LEFT */}
        <div className="lg:col-span-2">
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-md border border-line bg-surface px-3 py-1 font-medium">
              {course.mode}
            </span>
            <span className="rounded-md border border-line bg-surface px-3 py-1 font-medium">
              {course.level}
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">
            {course.title}
          </h1>
          <p className="mt-4 text-muted">{course.description}</p>

          <div className="mt-5 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full border border-line font-semibold text-primary">
              {initials(course.instructor)}
            </span>
            <div>
              <p className="font-semibold">{course.instructor}</p>
              <p className="text-xs text-muted">Lead Instructor</p>
            </div>
          </div>

          {/* What you'll learn */}
          {learn.length > 0 && (
            <section className="mt-10 rounded-lg border border-line bg-surface p-6">
              <h2 className="text-2xl font-bold">What you'll learn</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {learn.map((item, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <Check
                      size={18}
                      className="mt-0.5 shrink-0 text-emerald-500"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Curriculum */}
          {curriculum.length > 0 && (
            <section className="mt-10">
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Curriculum</h2>
                  <p className="text-sm text-muted">
                    {curriculum.length} modules · {totalLessons} lessons
                  </p>
                </div>
                <button
                  onClick={toggleAll}
                  className="text-sm font-medium text-primary"
                >
                  {allOpen ? "Collapse all" : "Expand all"}
                </button>
              </div>

              <div className="space-y-3">
                {curriculum.map((mod, i) => {
                  const isOpen = open.has(i);
                  return (
                    <div
                      key={i}
                      className="overflow-hidden rounded-lg border border-line bg-surface"
                    >
                      <button
                        onClick={() => toggle(i)}
                        className="flex w-full items-center gap-4 p-4 text-left"
                      >
                        <span className="flex-1">
                          <span className="block font-semibold">
                            {mod.title}
                          </span>
                          <span className="text-xs text-muted">
                            {mod.lessons.length} lessons
                          </span>
                        </span>
                        <ChevronDown
                          size={18}
                          className={`text-muted transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                        />
                      </button>

                      <div
                        className={`grid transition-all duration-300 ${
                          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <ul className="space-y-1 border-t border-line p-3">
                            {mod.lessons.map((lesson, j) => (
                              <li
                                key={j}
                                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm"
                              >
                                <PlayCircle
                                  size={16}
                                  className="text-primary"
                                />
                                {lesson}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* RIGHT: sticky buy card (desktop) */}
        <aside className="hidden h-fit overflow-hidden rounded-lg border border-line bg-surface lg:sticky lg:top-24 lg:block">
          <img
            src={imageUrl(course.thumbnail)}
            alt={course.title}
            className="aspect-video w-full bg-surface-2 object-cover"
          />
          <div className="p-5">
            <p className="text-3xl font-extrabold">
              {formatPrice(course.price)}
            </p>
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
            <div className="mt-4">{action}</div>

            <p className="mb-3 mt-6 text-sm font-semibold">
              Course details
            </p>
            <ul className="space-y-3 text-sm">
              {includes.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <Icon size={16} className="text-primary" /> {text}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {/* Mobile bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-page/95 p-3 backdrop-blur-md lg:hidden">
        {error && (
          <p className="mb-2 text-center text-xs text-red-500">{error}</p>
        )}
        <div className="mx-auto flex max-w-md items-center gap-4">
          <p className="text-2xl font-extrabold">{formatPrice(course.price)}</p>
          <div className="flex-1">{action}</div>
        </div>
      </div>
    </div>
  );
}
