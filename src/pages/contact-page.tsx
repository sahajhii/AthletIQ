import { useForm } from "react-hook-form";
import { Badge } from "@/components/shared/badge";
import { Button } from "@/components/shared/button";
import { Card } from "@/components/shared/card";
import { Input } from "@/components/shared/input";
import { Textarea } from "@/components/shared/textarea";

export function ContactPage() {
  const { register, handleSubmit, reset } = useForm();

  return (
    <section className="section-shell py-16">
      <Badge>Contact</Badge>
      <h1 className="mt-4 text-4xl font-bold">Talk to the AthletIQ team</h1>
      <Card className="mt-10 max-w-3xl">
        <form
          className="space-y-4"
          onSubmit={handleSubmit(() => {
            reset();
          })}
        >
          <Input placeholder="Name" {...register("name")} />
          <Input type="email" placeholder="Email" {...register("email")} />
          <Textarea placeholder="How can we help?" {...register("message")} />
          <Button type="submit">Send message</Button>
        </form>
      </Card>
    </section>
  );
}
