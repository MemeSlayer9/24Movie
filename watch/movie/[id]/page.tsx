interface Props {
  params: { id: string };
}

export default function MoviePage({ params }: Props) {
  const { id } = params;

  return <div>Movie ID: {id}</div>;
}