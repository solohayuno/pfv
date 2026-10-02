
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import { useState, useTransition, useMemo, useEffect } from "react";
import { format, differenceInYears } from "date-fns";
import { es, enUS } from 'date-fns/locale';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { findSacramentDateAction, saveEnrollmentAction } from "@/app/actions";
import type { FindSacramentDateOutput } from "@/ai/flows/sacrament-date-finder";
import { Label } from "@/components/ui/label";
import PDFPreview from "./pdf-preview";

import {
  CalendarDays,
  Sparkles,
  Loader2,
  Users,
  Baby,
  FileText,
  CheckCircle2,
  Circle,
  ArrowLeft,
  ArrowRight
} from "lucide-react";
import { CrossIcon, DoveIcon, ChaliceIcon, MaleIcon, FemaleIcon } from "@/components/icons";
import type { Locale } from "@/lib/i18n-config";

const createParticipantSchema = (dictionary: any) => z.object({
  fullName: z.string().min(3, dictionary.validation.fullName),
  dob: z.date({ required_error: dictionary.validation.dob }),
  address: z.string().min(5, dictionary.validation.address),
  phone: z.string().min(7, dictionary.validation.phone),
  maritalStatus: z.enum(["Single", "Divorced", "Widowed", "Married (Civil)"], {
    required_error: dictionary.validation.maritalStatus,
  }),
  previouslyMarried: z.enum(["Yes", "No"], { required_error: dictionary.validation.previouslyMarried }),
  parish: z.string().min(3, dictionary.validation.parish),
  sacraments: z.object({
    baptism: z.boolean().default(false),
    baptismDate: z.string().optional(),
    firstCommunion: z.boolean().default(false),
    firstCommunionDate: z.string().optional(),
    confirmation: z.boolean().default(false),
    confirmationDate: z.string().optional(),
  }),
});

const createFormSchema = (dictionary: any) => z.object({
  groom: createParticipantSchema(dictionary.participantCard),
  bride: createParticipantSchema(dictionary.participantCard),
  datingDuration: z.string().min(1, dictionary.relationshipInfo.validation.datingDuration),
  liveTogether: z.enum(["Yes", "No"], { required_error: dictionary.relationshipInfo.validation.liveTogether }),
  timeLivingTogether: z.string().optional(),
  weddingDate: z.date().optional(),
  childrenInCommon: z.coerce.number().min(0).optional(),
  groomChildren: z.coerce.number().min(0).optional(),
  brideChildren: z.coerce.number().min(0).optional(),
});


type SacramentFinderState = {
  open: boolean;
  participantKey: "groom" | "bride" | null;
  sacramentType: "Baptism" | "First Communion" | "Confirmation" | null;
  participantName: string;
};

function calculateAge(dob: Date | undefined): number | null {
    if (!dob) return null;
    return differenceInYears(new Date(), dob);
}

// Helper to calculate completion percentage
const calculateCompletion = (data: any, requiredFields: string[]): number => {
    if (!data) return 0;
    const completedFields = requiredFields.filter(field => {
        const value = field.split('.').reduce((o, i) => o?.[i], data);
        return value !== undefined && value !== null && value !== '';
    });
    return (completedFields.length / requiredFields.length) * 100;
};

const requiredFieldsByTab = {
    groom: ['groom.fullName', 'groom.dob', 'groom.address', 'groom.phone', 'groom.maritalStatus', 'groom.previouslyMarried', 'groom.parish'],
    bride: ['bride.fullName', 'bride.dob', 'bride.address', 'bride.phone', 'bride.maritalStatus', 'bride.previouslyMarried', 'bride.parish'],
    relationship: ['datingDuration', 'liveTogether'],
    children: [], // No required fields in children tab
};

function SacramentFinderDialog({
  state,
  onClose,
  onDateFound,
  dictionary
}: {
  state: SacramentFinderState;
  onClose: () => void;
  onDateFound: (result: FindSacramentDateOutput) => void;
  dictionary: any;
}) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const approximateYear = formData.get("approximateYear") as string;
    const location = formData.get("location") as string;

    if (!state.participantKey || !state.sacramentType || !state.participantName) return;

    startTransition(async () => {
      try {
        const result = await findSacramentDateAction({
          name: state.participantName,
          sacramentType: state.sacramentType,
          approximateYear,
          location,
        });
        onDateFound(result);
        toast({
          title: dictionary.toast.success.title,
          description: `${dictionary.toast.success.description1} ${state.sacramentType} ${dictionary.toast.success.description2} ${result.confidenceLevel * 100}% ${dictionary.toast.success.description3}`,
        });
        onClose();
      } catch (error) {
        toast({
          variant: "destructive",
          title: dictionary.toast.error.title,
          description: dictionary.toast.error.description,
        });
      }
    });
  };

  return (
    <Dialog open={state.open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-headline">
            {dictionary.title}: {state.sacramentType}
          </DialogTitle>
          <DialogDescription>
            {dictionary.description} {state.participantName}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="approximateYear">{dictionary.approximateYearLabel}</Label>
            <Input
              id="approximateYear"
              name="approximateYear"
              placeholder={dictionary.approximateYearPlaceholder}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">{dictionary.locationLabel}</Label>
            <Input
              id="location"
              name="location"
              placeholder={dictionary.locationPlaceholder}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
              {dictionary.cancelButton}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : dictionary.findButton}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DatePickerField({ field, dictionary, datePickerLocale, disabled, fromYear, toYear, placeholder }: any) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(field.value);

  const handleConfirm = () => {
    field.onChange(selectedDate);
    setPopoverOpen(false);
  };
  
  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant={"outline"}
            className={cn(
              "w-full pl-3 text-left font-normal",
              !field.value && "text-muted-foreground"
            )}
          >
            {field.value ? (
              <span>{format(field.value, "PPP", { locale: datePickerLocale })}</span>
            ) : (
              <span>{placeholder}</span>
            )}
            <CalendarDays className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          locale={datePickerLocale}
          mode="single"
          captionLayout="dropdown-buttons"
          fromYear={fromYear}
          toYear={toYear}
          selected={selectedDate}
          onSelect={setSelectedDate}
          disabled={disabled}
          initialFocus
        />
        <div className="p-2 border-t flex justify-end">
          <Button size="sm" onClick={handleConfirm}>{dictionary.okButton}</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}


function ParticipantCard({
  participantKey,
  form,
  onFindSacrament,
  dictionary,
  gender,
  lang,
  className
}: {
  participantKey: "groom" | "bride";
  form: any;
  onFindSacrament: (
    participantKey: "groom" | "bride",
    sacramentType: "Baptism" | "First Communion" | "Confirmation"
  ) => void;
  dictionary: any;
  gender: 'male' | 'female';
  lang: Locale;
  className?: string;
}) {

  const watchedSacraments = useWatch({
    control: form.control,
    name: `${participantKey}.sacraments`
  });
  
  const dob = useWatch({
    control: form.control,
    name: `${participantKey}.dob`
  });
  const age = calculateAge(dob);

  const placeholders = gender === 'male' ? dictionary.placeholders.groom : dictionary.placeholders.bride;

  const sacramentFields: {
    key: "baptism" | "firstCommunion" | "confirmation";
    label: "Baptism" | "First Communion" | "Confirmation";
    Icon: React.ElementType;
  }[] = [
    { key: "baptism", label: "Baptism", Icon: CrossIcon },
    { key: "firstCommunion", label: "First Communion", Icon: ChaliceIcon },
    { key: "confirmation", label: "Confirmation", Icon: DoveIcon },
  ];

  const datePickerLocale = lang === 'es' ? es : enUS;

  return (
    <Card className={cn("shadow-lg transition-colors duration-300 border-2", className)}>
      <CardContent className="space-y-6 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name={`${participantKey}.fullName`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dictionary.fullName}</FormLabel>
                <FormControl>
                  <Input placeholder={placeholders.fullName} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name={`${participantKey}.dob`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.dob}</FormLabel>
                  <DatePickerField 
                    field={field}
                    dictionary={dictionary}
                    datePickerLocale={datePickerLocale}
                    fromYear={new Date().getFullYear() - 100}
                    toYear={new Date().getFullYear()}
                    disabled={(date: Date) => date > new Date() || date < new Date("1900-01-01")}
                    placeholder={dictionary.pickADate}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>{dictionary.age}</FormLabel>
              <FormControl>
                <Input
                  readOnly
                  value={age !== null ? `${age} ${dictionary.yearsOld}` : ''}
                  className="bg-muted"
                />
              </FormControl>
            </FormItem>
          </div>
          <FormField
            control={form.control}
            name={`${participantKey}.address`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dictionary.address}</FormLabel>
                <FormControl>
                  <Input placeholder={placeholders.address} {...field} />
                </FormControl>
                <FormDescription>
                  {dictionary.descriptions.address}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`${participantKey}.phone`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dictionary.phone}</FormLabel>
                <FormControl>
                  <Input placeholder={placeholders.phone} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`${participantKey}.maritalStatus`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dictionary.maritalStatus}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={dictionary.maritalStatusPlaceholder} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Single">{gender === 'male' ? dictionary.maritalStatusOptions.single_male : dictionary.maritalStatusOptions.single_female}</SelectItem>
                    <SelectItem value="Divorced">{gender === 'male' ? dictionary.maritalStatusOptions.divorced_male : dictionary.maritalStatusOptions.divorced_female}</SelectItem>
                    <SelectItem value="Widowed">{gender === 'male' ? dictionary.maritalStatusOptions.widowed_male : dictionary.maritalStatusOptions.widowed_female}</SelectItem>
                    <SelectItem value="Married (Civil)">{gender === 'male' ? dictionary.maritalStatusOptions.civil_male : dictionary.maritalStatusOptions.civil_female}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name={`${participantKey}.parish`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dictionary.parish}</FormLabel>
                <FormControl>
                  <Input placeholder={placeholders.parish} {...field} />
                </FormControl>
                <FormDescription>
                  {dictionary.descriptions.parish}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
              control={form.control}
              name={`${participantKey}.previouslyMarried`}
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>{dictionary.previouslyMarried}</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Yes" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {dictionary.yes}
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="No" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {dictionary.no}
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormDescription>
                    {dictionary.descriptions.previouslyMarried}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-lg font-semibold font-headline">{dictionary.sacramentalHistory}</h3>
          {sacramentFields.map(({ key, label, Icon }) => (
             <FormField
              key={key}
              control={form.control}
              name={`${participantKey}.sacraments.${key}`}
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none w-full">
                    <FormLabel className="flex items-center gap-2">
                      <Icon className="h-5 w-5" /> {dictionary.sacraments[key]} {dictionary.received}
                    </FormLabel>
                    {watchedSacraments?.[key] && (
                        <div className="flex items-center gap-2 pt-2">
                            <Input
                                disabled
                                value={form.getValues(`${participantKey}.sacraments.${key}Date`) || dictionary.noDateSet}
                                className="flex-grow"
                            />
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => onFindSacrament(participantKey, label)}
                            >
                                <Sparkles className="mr-2 h-4 w-4" /> {dictionary.findDate}
                            </Button>
                        </div>
                    )}
                  </div>
                </FormItem>
              )}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

const TabProgressIcon = ({ percentage }: { percentage: number }) => {
    if (percentage === 100) {
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }
    return <Circle className="h-5 w-5 text-muted-foreground" />;
};


export default function EnrollmentForm({ dictionary, lang }: { dictionary: any, lang: Locale }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  
  const tabs = ["groom", "bride", "relationship", "children"];
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [visitedTabs, setVisitedTabs] = useState(new Set([tabs[0]]));

  useEffect(() => {
    setVisitedTabs((prev) => new Set(prev).add(activeTab));
  }, [activeTab]);

  const formSchema = createFormSchema(dictionary.form);
  type FormValues = z.infer<typeof formSchema>;
  const [formData, setFormData] = useState<FormValues | null>(null);

  const [dialogState, setDialogState] = useState<SacramentFinderState>({
    open: false,
    participantKey: null,
    sacramentType: null,
    participantName: "",
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onBlur',
    defaultValues: {
      groom: {
        fullName: "",
        address: "",
        phone: "",
        parish: "",
        sacraments: {
          baptism: false,
          firstCommunion: false,
          confirmation: false,
        },
      },
      bride: {
        fullName: "",
        address: "",
        phone: "",
        parish: "",
        sacraments: {
          baptism: false,
          firstCommunion: false,
          confirmation: false,
        },
      },
      datingDuration: "",
      childrenInCommon: 0,
      groomChildren: 0,
      brideChildren: 0,
    },
  });
  
  const watchedValues = useWatch({ control: form.control });

  const progress = useMemo(() => {
    const groomCompletion = calculateCompletion(watchedValues, requiredFieldsByTab.groom);
    const brideCompletion = calculateCompletion(watchedValues, requiredFieldsByTab.bride);
    const relationshipCompletion = calculateCompletion(watchedValues, requiredFieldsByTab.relationship);
    const allRequiredFields = [...requiredFieldsByTab.groom, ...requiredFieldsByTab.bride, ...requiredFieldsByTab.relationship];
    const totalCompletion = calculateCompletion(watchedValues, allRequiredFields);

    return {
        groom: groomCompletion,
        bride: brideCompletion,
        relationship: relationshipCompletion,
        children: 100, // No required fields, so always 100%
        total: totalCompletion
    };
  }, [watchedValues]);

  const liveTogether = useWatch({
    control: form.control,
    name: "liveTogether",
  });
  
  const allTabsVisited = visitedTabs.size === tabs.length;
  const isFormComplete = progress.total >= 100 && allTabsVisited;

  async function onFinalSubmit() {
    if (!formData) return;
    setIsSubmitting(true);
    
    try {
      const result = await saveEnrollmentAction(formData);
      if (result.success) {
        toast({
          title: dictionary.form.submitToast.title,
          description: dictionary.form.submitToast.description,
        });
        setShowPDFPreview(false);
        form.reset();
        setActiveTab(tabs[0]);
        setVisitedTabs(new Set([tabs[0]]));
      } else {
        throw new Error(result.error || "An unknown error occurred");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save the enrollment. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleGeneratePDF = (values: FormValues) => {
    setFormData(values);
    setShowPDFPreview(true);
  };


  const handleFindSacrament = (
    participantKey: "groom" | "bride",
    sacramentType: "Baptism" | "First Communion" | "Confirmation"
  ) => {
    const participantName = form.getValues(`${participantKey}.fullName`);
    if (!participantName) {
      toast({
        variant: "destructive",
        title: dictionary.form.missingNameToast.title,
        description: dictionary.form.missingNameToast.description,
      });
      return;
    }
    setDialogState({
      open: true,
      participantKey,
      sacramentType,
      participantName,
    });
  };

  const handleDateFound = (result: FindSacramentDateOutput) => {
    if (dialogState.participantKey && dialogState.sacramentType) {
        const sacramentKey = dialogState.sacramentType === "Baptism" ? "baptismDate" : dialogState.sacramentType === "First Communion" ? "firstCommunionDate" : "confirmationDate";
        form.setValue(
            `${dialogState.participantKey}.sacraments.${sacramentKey}`,
            result.sacramentDate
        );
    }
  };
  
  const datePickerLocale = lang === 'es' ? es : enUS;

  const handleNext = () => {
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  const cardBorderColor = {
    groom: 'border-groom',
    bride: 'border-bride',
    relationship: 'border-relationship',
    children: 'border-children',
  }[activeTab] || 'border-border';

  return (
    <>
      <SacramentFinderDialog
        state={dialogState}
        onClose={() => setDialogState((prev) => ({ ...prev, open: false }))}
        onDateFound={handleDateFound}
        dictionary={dictionary.form.sacramentFinderDialog}
      />
       {formData && (
        <PDFPreview
          isOpen={showPDFPreview}
          onClose={() => setShowPDFPreview(false)}
          formData={formData}
          dictionary={dictionary}
          lang={lang}
          onConfirm={onFinalSubmit}
          isSubmitting={isSubmitting}
        />
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleGeneratePDF)} className="space-y-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
               <TabsTrigger value="groom" className="flex items-center gap-2">
                <TabProgressIcon percentage={progress.groom} />
                <MaleIcon className="h-5 w-5" />
                <span className="hidden sm:inline ml-2">{dictionary.form.groom}</span>
              </TabsTrigger>
              <TabsTrigger value="bride" className="flex items-center gap-2">
                <TabProgressIcon percentage={progress.bride} />
                <FemaleIcon className="h-5 w-5" />
                <span className="hidden sm:inline ml-2">{dictionary.form.bride}</span>
              </TabsTrigger>
              <TabsTrigger value="relationship" className="flex items-center gap-2">
                <TabProgressIcon percentage={progress.relationship} />
                <Users className="h-5 w-5" />
                <span className="hidden sm:inline ml-2">{dictionary.form.relationshipInfo.tabTitle}</span>
              </TabsTrigger>
              <TabsTrigger value="children" className="flex items-center gap-2">
                <TabProgressIcon percentage={progress.children} />
                <Baby className="h-5 w-5" />
                <span className="hidden sm:inline ml-2">{dictionary.form.childrenInfo.tabTitle}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="groom">
              <ParticipantCard
                participantKey="groom"
                form={form}
                onFindSacrament={handleFindSacrament}
                dictionary={dictionary.form.participantCard}
                gender="male"
                lang={lang}
                className={cardBorderColor}
              />
            </TabsContent>

            <TabsContent value="bride">
              <ParticipantCard
                participantKey="bride"
                form={form}
                onFindSacrament={handleFindSacrament}
                dictionary={dictionary.form.participantCard}
                gender="female"
                lang={lang}
                className={cardBorderColor}
              />
            </TabsContent>

            <TabsContent value="relationship">
              <Card className={cn("transition-colors duration-300 border-2 shadow-lg", cardBorderColor)}>
                <CardHeader>
                  <CardTitle className="font-headline text-2xl flex items-center gap-2">
                    <Users /> {dictionary.form.relationshipInfo.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="datingDuration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{dictionary.form.relationshipInfo.datingDuration}</FormLabel>
                          <FormControl>
                            <Input placeholder={dictionary.form.relationshipInfo.datingDurationPlaceholder} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="weddingDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{dictionary.form.relationshipInfo.weddingDateSet}</FormLabel>
                          <DatePickerField
                            field={field}
                            dictionary={dictionary.form.participantCard}
                            datePickerLocale={datePickerLocale}
                            fromYear={new Date().getFullYear()}
                            toYear={new Date().getFullYear() + 10}
                            disabled={(date: Date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            placeholder={dictionary.form.relationshipInfo.pickWeddingDate}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                      control={form.control}
                      name="liveTogether"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>{dictionary.form.relationshipInfo.liveTogether}</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-row space-x-4"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="Yes" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {dictionary.form.relationshipInfo.yes}
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="No" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {dictionary.form.relationshipInfo.no}
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {liveTogether === "Yes" && (
                        <FormField
                          control={form.control}
                          name="timeLivingTogether"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{dictionary.form.relationshipInfo.timeLivingTogether}</FormLabel>
                              <FormControl>
                                <Input placeholder={dictionary.form.relationshipInfo.timeLivingTogetherPlaceholder} {...field} />
                              </FormControl>
                              <FormDescription>
                                {dictionary.form.relationshipInfo.descriptions.timeLivingTogether}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                    )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="children">
              <Card className={cn("transition-colors duration-300 border-2 shadow-lg", cardBorderColor)}>
                <CardHeader>
                  <CardTitle className="font-headline text-2xl flex items-center gap-2">
                    <Baby /> {dictionary.form.childrenInfo.title}
                  </CardTitle>
                  <CardDescription>
                    {dictionary.form.childrenInfo.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="childrenInCommon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{dictionary.form.childrenInfo.inCommon}</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="groomChildren"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{dictionary.form.childrenInfo.groom}</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="brideChildren"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{dictionary.form.childrenInfo.bride}</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-8 pt-4 border-t">
              <div className="flex justify-between items-center mb-2">
                  <Label>{dictionary.form.totalProgress}</Label>
                  <span className="text-sm font-medium text-muted-foreground">
                      {Math.round(progress.total)}%
                  </span>
              </div>
              <Progress value={progress.total} className="w-full" />
          </div>

          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={tabs.indexOf(activeTab) === 0}
              className="px-4 sm:px-6"
            >
              <ArrowLeft className="h-5 w-5 sm:mr-2" />
              <span className="hidden sm:inline">{dictionary.form.previousButton}</span>
            </Button>

            <Button
              type="submit"
              size="lg"
              disabled={!isFormComplete || isSubmitting}
              className="px-4 sm:px-8"
            >
              <FileText className="h-5 w-5 sm:mr-2" />
              <span className="hidden sm:inline">{dictionary.form.generatePDF}</span>
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleNext}
              disabled={tabs.indexOf(activeTab) === tabs.length - 1}
              className="px-4 sm:px-6"
            >
               <span className="hidden sm:inline">{dictionary.form.nextButton}</span>
               <ArrowRight className="h-5 w-5 sm:ml-2" />
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
